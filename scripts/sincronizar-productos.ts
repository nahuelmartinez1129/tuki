/**
 * ==========================================================
 * SINCRONIZAR PRODUCTOS: LOCAL → PRODUCCIÓN
 * ==========================================================
 *
 * Deja los productos de producción IGUALES a los de tu PC
 * (nombre, descripción, precio, imagen, categoría, tags,
 * stock, activo, combo y orden).
 *
 * 1) En tu PC (base local):
 *      npx tsx scripts/sincronizar-productos.ts exportar
 *    Crea datos/productos.json. Subilo con git.
 *
 * 2) En el VPS (base de producción), después del git pull:
 *      npx tsx scripts/sincronizar-productos.ts importar
 *    Solo MUESTRA lo que cambiaría.
 *
 *      npx tsx scripts/sincronizar-productos.ts importar --aplicar
 *    Guarda una copia en backups/ y aplica los cambios.
 *
 * Cómo empareja cada producto: por id, si no por nombre,
 * si no por imagen.
 *
 * Los productos de producción que no están en tu PC NO se
 * borran: quedan desactivados y con stock 0 (no se ven en
 * la tienda y se pueden reactivar desde el admin).
 * Pedidos, clientes y caja no se tocan.
 * ==========================================================
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient, type Producto } from "@prisma/client";

const prisma = new PrismaClient();

const ARCHIVO = path.join(process.cwd(), "datos", "productos.json");

const CAMPOS = [
  "name",
  "description",
  "price",
  "compareAtPrice",
  "image",
  "category",
  "tags",
  "stock",
  "activo",
  "isCombo",
  "orden",
] as const;

type Campo = (typeof CAMPOS)[number];
type DatosProducto = Pick<Producto, "id" | Campo>;

const accion = process.argv[2];
const APLICAR = process.argv.includes("--aplicar");

function datosDe(p: Producto): DatosProducto {
  const d = { id: p.id } as DatosProducto;
  for (const c of CAMPOS) (d as Record<string, unknown>)[c] = p[c];
  return d;
}

function iguales(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function mostrar(v: unknown) {
  if (typeof v === "string" && v.length > 40) return `"${v.slice(0, 37)}..."`;
  return JSON.stringify(v);
}

async function exportar() {
  const productos = await prisma.producto.findMany({
    orderBy: [{ orden: "asc" }, { name: "asc" }],
  });

  fs.mkdirSync(path.dirname(ARCHIVO), { recursive: true });
  fs.writeFileSync(
    ARCHIVO,
    JSON.stringify(productos.map(datosDe), null, 2) + "\n",
    "utf8"
  );

  console.log(
    `Exportados ${productos.length} productos (${
      productos.filter((p) => p.activo).length
    } activos) a datos/productos.json`
  );
  console.log("Ahora subilo: git add datos/productos.json && git commit && git push");
}

async function importar() {
  if (!fs.existsSync(ARCHIVO)) {
    throw new Error("No existe datos/productos.json. ¿Hiciste git pull?");
  }

  const deseados: DatosProducto[] = JSON.parse(fs.readFileSync(ARCHIVO, "utf8"));
  const actuales = await prisma.producto.findMany();

  // Imágenes que no existen en public/
  const sinImagen = deseados.filter(
    (p) => !fs.existsSync(path.join(process.cwd(), "public", p.image))
  );
  if (sinImagen.length > 0) {
    console.log("AVISO: imágenes que no están en public/ (hacé git pull):");
    for (const p of sinImagen) console.log(`  ${p.name}: ${p.image}`);
    console.log();
  }

  const usados = new Set<string>();

  const emparejar = (d: DatosProducto) => {
    const libre = (p: Producto) => !usados.has(p.id);
    return (
      actuales.find((p) => libre(p) && p.id === d.id) ??
      actuales.find((p) => libre(p) && p.name === d.name) ??
      actuales.find((p) => libre(p) && p.image === d.image)
    );
  };

  const cambios: { id: string; nombre: string; datos: Partial<DatosProducto>; detalle: string[] }[] = [];
  const nuevos: DatosProducto[] = [];

  for (const d of deseados) {
    const actual = emparejar(d);

    if (!actual) {
      nuevos.push(d);
      continue;
    }

    usados.add(actual.id);

    const datos: Partial<DatosProducto> = {};
    const detalle: string[] = [];

    for (const c of CAMPOS) {
      if (!iguales(actual[c], d[c])) {
        (datos as Record<string, unknown>)[c] = d[c];
        detalle.push(`${c}: ${mostrar(actual[c])} → ${mostrar(d[c])}`);
      }
    }

    if (detalle.length > 0) {
      cambios.push({ id: actual.id, nombre: actual.name, datos, detalle });
    }
  }

  const sobrantes = actuales.filter(
    (p) => !usados.has(p.id) && (p.activo || p.stock !== 0)
  );

  console.log(`ACTUALIZAR (${cambios.length})`);
  for (const c of cambios) {
    console.log(`  ${c.nombre}`);
    for (const linea of c.detalle) console.log(`      ${linea}`);
  }

  console.log(`\nCREAR (${nuevos.length})`);
  for (const p of nuevos) {
    console.log(`  ${p.name}: $${p.price}, stock ${p.stock}${p.activo ? "" : " (inactivo)"}`);
  }

  console.log(`\nDESACTIVAR, no están en tu PC (${sobrantes.length})`);
  for (const p of sobrantes) console.log(`  ${p.name}: stock ${p.stock} → 0`);

  if (!APLICAR) {
    console.log("\nVista previa: no se cambió nada.");
    console.log("Para aplicar: npx tsx scripts/sincronizar-productos.ts importar --aplicar");
    return;
  }

  // Copia de seguridad
  fs.mkdirSync("backups", { recursive: true });
  const respaldo = path.join(
    "backups",
    `productos-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
  );
  fs.writeFileSync(respaldo, JSON.stringify(actuales, null, 2));
  console.log(`\nCopia de seguridad: ${respaldo}`);

  await prisma.$transaction([
    ...cambios.map((c) =>
      prisma.producto.update({ where: { id: c.id }, data: c.datos })
    ),
    ...nuevos.map(({ id, ...datos }) =>
      prisma.producto.create({
        // Mantiene el mismo id que en tu PC si está libre
        data: actuales.some((p) => p.id === id) ? datos : { id, ...datos },
      })
    ),
    ...(sobrantes.length > 0
      ? [
          prisma.producto.updateMany({
            where: { id: { in: sobrantes.map((p) => p.id) } },
            data: { activo: false, stock: 0 },
          }),
        ]
      : []),
  ]);

  console.log("Listo: productos de producción iguales a los de tu PC.");
}

(async () => {
  if (accion === "exportar") await exportar();
  else if (accion === "importar") await importar();
  else {
    console.log("Uso:");
    console.log("  npx tsx scripts/sincronizar-productos.ts exportar");
    console.log("  npx tsx scripts/sincronizar-productos.ts importar [--aplicar]");
    process.exitCode = 1;
  }
})()
  .catch((e) => {
    console.error("ERROR:", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
