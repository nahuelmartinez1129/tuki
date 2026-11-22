/**
 * ==========================================================
 * SINCRONIZAR ZONAS DE ENVÍO Y PREMIOS DE LA RULETA
 * LOCAL → PRODUCCIÓN
 * ==========================================================
 *
 * 1) En tu PC:
 *      npx tsx scripts/sincronizar-config.ts exportar
 *    Crea datos/zonas-envio.json y datos/premios.json.
 *    Subilos con git.
 *
 * 2) En el VPS, después del git pull:
 *      npx tsx scripts/sincronizar-config.ts importar
 *    Solo MUESTRA lo que cambiaría.
 *
 *      npx tsx scripts/sincronizar-config.ts importar --aplicar
 *    Guarda una copia en backups/ y aplica.
 *
 * Zonas: se emparejan por id y si no por nombre. Se copian
 * nombre, precio, compra mínima, activa, orden y el dibujo
 * (polígono).
 *
 * Premios: se emparejan por id y si no por tipo. Se copian
 * nombre, tipo, valor, probabilidad y activo.
 *
 * Lo que está en producción y no en tu PC NO se borra:
 * queda desactivado.
 * ==========================================================
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DIR = path.join(process.cwd(), "datos");
const ARCHIVO_ZONAS = path.join(DIR, "zonas-envio.json");
const ARCHIVO_PREMIOS = path.join(DIR, "premios.json");

const accion = process.argv[2];
const APLICAR = process.argv.includes("--aplicar");

const CAMPOS_ZONA = ["nombre", "precio", "compraMinima", "activo", "orden", "poligono"] as const;
const CAMPOS_PREMIO = ["nombre", "tipo", "valor", "probabilidad", "activo"] as const;

type Registro = { id: string } & Record<string, unknown>;

function elegir(obj: Record<string, unknown>, campos: readonly string[]) {
  const r: Registro = { id: String(obj.id) };
  for (const c of campos) r[c] = obj[c];
  return r;
}

const iguales = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function mostrar(campo: string, v: unknown) {
  if (campo === "poligono") return Array.isArray(v) ? `dibujo de ${v.length} puntos` : "sin dibujo";
  return JSON.stringify(v);
}

type Plan = {
  titulo: string;
  actualizar: { id: string; nombre: string; datos: Record<string, unknown>; detalle: string[] }[];
  crear: Registro[];
  desactivar: { id: string; nombre: string }[];
};

function planificar(
  titulo: string,
  deseados: Registro[],
  actuales: Registro[],
  campos: readonly string[],
  claveAlternativa: string
): Plan {
  const usados = new Set<string>();
  const plan: Plan = { titulo, actualizar: [], crear: [], desactivar: [] };

  for (const d of deseados) {
    const libre = (a: Registro) => !usados.has(a.id);
    const actual =
      actuales.find((a) => libre(a) && a.id === d.id) ??
      actuales.find((a) => libre(a) && a[claveAlternativa] === d[claveAlternativa]);

    if (!actual) {
      plan.crear.push(d);
      continue;
    }

    usados.add(actual.id);

    const datos: Record<string, unknown> = {};
    const detalle: string[] = [];

    for (const c of campos) {
      if (!iguales(actual[c], d[c])) {
        datos[c] = d[c];
        detalle.push(`${c}: ${mostrar(c, actual[c])} → ${mostrar(c, d[c])}`);
      }
    }

    if (detalle.length > 0) {
      plan.actualizar.push({ id: actual.id, nombre: String(actual.nombre), datos, detalle });
    }
  }

  for (const a of actuales) {
    if (!usados.has(a.id) && a.activo) {
      plan.desactivar.push({ id: a.id, nombre: String(a.nombre) });
    }
  }

  return plan;
}

function imprimir(plan: Plan) {
  console.log(`\n========== ${plan.titulo} ==========`);
  console.log(`ACTUALIZAR (${plan.actualizar.length})`);
  for (const a of plan.actualizar) {
    console.log(`  ${a.nombre}`);
    for (const l of a.detalle) console.log(`      ${l}`);
  }
  console.log(`CREAR (${plan.crear.length})`);
  for (const c of plan.crear) console.log(`  ${c.nombre}`);
  console.log(`DESACTIVAR, no están en tu PC (${plan.desactivar.length})`);
  for (const d of plan.desactivar) console.log(`  ${d.nombre}`);
}

// Prisma necesita JsonNull para guardar un polígono vacío
function datosZona(d: Record<string, unknown>) {
  return "poligono" in d && d.poligono === null
    ? { ...d, poligono: Prisma.JsonNull }
    : d;
}

async function exportar() {
  const zonas = await prisma.zonaEnvio.findMany({ orderBy: { orden: "asc" } });
  const premios = await prisma.premio.findMany({ orderBy: { probabilidad: "desc" } });

  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(
    ARCHIVO_ZONAS,
    JSON.stringify(zonas.map((z) => elegir(z, CAMPOS_ZONA)), null, 2) + "\n"
  );
  fs.writeFileSync(
    ARCHIVO_PREMIOS,
    JSON.stringify(premios.map((p) => elegir(p, CAMPOS_PREMIO)), null, 2) + "\n"
  );

  const suma = premios.filter((p) => p.activo).reduce((a, p) => a + p.probabilidad, 0);
  console.log(`Exportadas ${zonas.length} zonas a datos/zonas-envio.json`);
  console.log(`Exportados ${premios.length} premios (suman ${suma}%) a datos/premios.json`);
  console.log("Ahora subilos: git add datos && git commit && git push");
}

async function importar() {
  for (const f of [ARCHIVO_ZONAS, ARCHIVO_PREMIOS]) {
    if (!fs.existsSync(f)) throw new Error(`No existe ${path.relative(process.cwd(), f)}. ¿Hiciste git pull?`);
  }

  const zonasDeseadas: Registro[] = JSON.parse(fs.readFileSync(ARCHIVO_ZONAS, "utf8"));
  const premiosDeseados: Registro[] = JSON.parse(fs.readFileSync(ARCHIVO_PREMIOS, "utf8"));

  const zonasActuales = await prisma.zonaEnvio.findMany();
  const premiosActuales = await prisma.premio.findMany();

  const planZonas = planificar(
    "ZONAS DE ENVÍO",
    zonasDeseadas,
    zonasActuales as unknown as Registro[],
    CAMPOS_ZONA,
    "nombre"
  );
  const planPremios = planificar(
    "PREMIOS DE LA RULETA",
    premiosDeseados,
    premiosActuales as unknown as Registro[],
    CAMPOS_PREMIO,
    "tipo"
  );

  imprimir(planZonas);
  imprimir(planPremios);

  if (!APLICAR) {
    console.log("\nVista previa: no se cambió nada.");
    console.log("Para aplicar: npx tsx scripts/sincronizar-config.ts importar --aplicar");
    return;
  }

  fs.mkdirSync("backups", { recursive: true });
  const respaldo = path.join(
    "backups",
    `zonas-y-premios-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );
  fs.writeFileSync(
    respaldo,
    JSON.stringify({ zonas: zonasActuales, premios: premiosActuales }, null, 2)
  );
  console.log(`\nCopia de seguridad: ${respaldo}`);

  const idLibre = (id: string, actuales: { id: string }[]) => !actuales.some((a) => a.id === id);

  await prisma.$transaction([
    ...planZonas.actualizar.map((a) =>
      prisma.zonaEnvio.update({ where: { id: a.id }, data: datosZona(a.datos) as Prisma.ZonaEnvioUpdateInput })
    ),
    ...planZonas.crear.map(({ id, ...d }) =>
      prisma.zonaEnvio.create({
        data: datosZona(idLibre(id, zonasActuales) ? { id, ...d } : d) as Prisma.ZonaEnvioCreateInput,
      })
    ),
    ...planZonas.desactivar.map((d) =>
      prisma.zonaEnvio.update({ where: { id: d.id }, data: { activo: false } })
    ),
    ...planPremios.actualizar.map((a) =>
      prisma.premio.update({ where: { id: a.id }, data: a.datos as Prisma.PremioUpdateInput })
    ),
    ...planPremios.crear.map(({ id, ...d }) =>
      prisma.premio.create({
        data: (idLibre(id, premiosActuales) ? { id, ...d } : d) as Prisma.PremioCreateInput,
      })
    ),
    ...planPremios.desactivar.map((d) =>
      prisma.premio.update({ where: { id: d.id }, data: { activo: false } })
    ),
  ]);

  console.log("Listo: zonas y premios de producción iguales a los de tu PC.");
}

(async () => {
  if (accion === "exportar") await exportar();
  else if (accion === "importar") await importar();
  else {
    console.log("Uso:");
    console.log("  npx tsx scripts/sincronizar-config.ts exportar");
    console.log("  npx tsx scripts/sincronizar-config.ts importar [--aplicar]");
    process.exitCode = 1;
  }
})()
  .catch((e) => {
    console.error("ERROR:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
