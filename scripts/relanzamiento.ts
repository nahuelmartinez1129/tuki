/**
 * ==========================================
 * RELANZAMIENTO TUKI
 * ==========================================
 *
 * Actualiza productos, zonas de envío, premios
 * de la ruleta, Happy Hour y cupones según el
 * análisis de precios del relanzamiento.
 *
 * NO borra nada:
 * - Los productos del stock actual se activan
 *   con precio y stock nuevos (o se crean).
 * - Los demás productos quedan con stock 0.
 * - Los premios viejos se desactivan.
 *
 * Uso:
 *   npx tsx scripts/relanzamiento.ts            -> solo muestra los cambios
 *   npx tsx scripts/relanzamiento.ts --aplicar  -> respalda y aplica
 *
 * El respaldo queda en backups/.
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APLICAR = process.argv.includes("--aplicar");

/*
 * ==========================================
 * STOCK ACTUAL
 * ==========================================
 *
 * name: nombre exacto en la base. Si no
 * existe, se crea con los datos de "nuevo".
 */
type ProductoStock = {
  name: string;
  price: number;
  stock: number;
  nuevo?: {
    description: string;
    image: string;
    category: string;
  };
};

const STOCK: ProductoStock[] = [
  // Alfajores
  { name: "Alfajor Guaymallén Blanco", price: 600, stock: 6 },
  { name: "Alfajor Guaymallén Negro", price: 600, stock: 6 },
  { name: "Guaymallén Negro Triple", price: 1000, stock: 3 },
  {
    name: "Guaymallén Blanco Triple",
    price: 1000,
    stock: 2,
    nuevo: {
      description:
        "Alfajor triple con dulce de leche y baño de repostería blanco.",
      image: "/productos/guaymallen-triple-blanco_bg.png",
      category: "alfajores",
    },
  },
  { name: "Fantoche Triple Chocolate", price: 1600, stock: 5 },
  { name: "Giga By Spreen", price: 2100, stock: 5 },
  { name: "Alfajor Rasta Negro", price: 2100, stock: 10 },
  {
    name: "Jorgelín Negro",
    price: 2200,
    stock: 6,
    nuevo: {
      description:
        "Maxialfajor Jorgelín de 90 g con dulce de leche y baño de chocolate.",
      image: "/productos/jorgelin-negro.jpeg",
      category: "alfajores",
    },
  },
  { name: "Aguila Minitorta Clásica", price: 2600, stock: 2 },
  { name: "Aguila Minitorta Brownie", price: 2600, stock: 5 },
  { name: "Alfajor Bon o Bon Triple", price: 2500, stock: 4 },
  {
    name: "Alfajor Milka Super Dulce de Leche",
    price: 2800,
    stock: 8,
  },
  {
    name: "Alfajor Matilda",
    price: 3300,
    stock: 5,
    nuevo: {
      description:
        "Alfajor sin gluten de 80 g, relleno y bañado en chocolate.",
      image: "/productos/matilda.jpeg",
      category: "alfajores",
    },
  },

  // Gomitas y caramelos
  // Mogul: ~6 g por unidad -> ~83 por bolsa de 500 g.
  // Supuesto: 2 bolsas de moritas y 2 de dientitos.
  { name: "Dientitos (Unidad)", price: 200, stock: 174 },
  {
    name: "Moritas (Unidad)",
    price: 200,
    stock: 166,
    nuevo: {
      description:
        "¡Las clásicas moritas Mogul! Se venden por unidad.",
      image: "/productos/moritas.jpeg",
      category: "gomitas",
    },
  },
  // Goma Miski 1 kg fraccionada en bolsitas de 50 g
  { name: "Conitos (50 g)", price: 1000, stock: 20 },
  {
    name: "Halls",
    price: 1200,
    stock: 12,
    nuevo: {
      description: "Caramelos de menta Halls. Paquete cerrado.",
      image: "/productos/halls.jpeg",
      category: "gomitas",
    },
  },
  {
    name: "Tic Tac",
    price: 1600,
    stock: 12,
    nuevo: {
      description: "Pastillas Tic Tac. Cajita cerrada de 16 g.",
      image: "/productos/tic-tac.jpeg",
      category: "gomitas",
    },
  },

  // Snacks
  { name: "Papas Slices", price: 1800, stock: 2 },

  // Bebidas
  { name: "Coca-Cola 500 ml", price: 3000, stock: 4 },
  {
    name: "Speed Unlimited 250 ml",
    price: 2700,
    stock: 4,
    nuevo: {
      description: "Bebida energizante Speed Unlimited en lata de 250 ml.",
      image: "/productos/speed.jpeg",
      category: "gaseosas",
    },
  },
];

/*
 * ==========================================
 * ZONAS DE ENVÍO
 * ==========================================
 *
 * Compra mínima única de $5.000.
 * A–E: $1.500 · F–H: $2.000.
 *
 * Zona A ampliada hacia Calle 44 1796
 * (cubre lo de antes + ~600 m alrededor
 * de la casa). Al estar primera en el orden,
 * tiene prioridad sobre la Zona G.
 */
const COMPRA_MINIMA = 5000;

const PRECIO_ZONA: Record<string, number> = {
  "Zona A": 1500,
  "Zona B": 1500,
  "Zona C": 1500,
  "Zona D": 1500,
  "Zona E": 1500,
  "Zona F": 2000,
  "Zona G": 2000,
  "Zona H": 2000,
};

const POLIGONO_ZONA_A = [
  { lat: -38.26858477698894, lng: -57.8697669211277 },
  { lat: -38.28189343416559, lng: -57.85214480789986 },
  { lat: -38.27679879764517, lng: -57.84554421901704 },
  { lat: -38.26319530083289, lng: -57.82859802246094 },
  { lat: -38.25010321497177, lng: -57.84677267074586 },
  { lat: -38.25519785149219, lng: -57.853373259628675 },
];

/*
 * ==========================================
 * PREMIOS DE LA RULETA
 * ==========================================
 *
 * Costo esperado ≈ $315 por premio canjeado.
 * Todos valen 48 h en compras desde $7.000
 * (envío gratis desde $10.000).
 */
const PREMIOS = [
  { tipo: "SIN_PREMIO", nombre: "Sin Premio", probabilidad: 30, valor: null },
  { tipo: "VOLVER_A_GIRAR", nombre: "Volvé a Girar", probabilidad: 20, valor: null },
  { tipo: "GUAYMALLEN", nombre: "Guaymallén de regalo", probabilidad: 20, valor: null },
  { tipo: "DESCUENTO", nombre: "$500 OFF", probabilidad: 13, valor: 500 },
  { tipo: "GOMITAS", nombre: "5 moritas de regalo", probabilidad: 12, valor: null },
  { tipo: "ENVIO_GRATIS", nombre: "Envío Gratis", probabilidad: 3, valor: null },
  { tipo: "ALFAJOR", nombre: "Alfajor a elección", probabilidad: 2, valor: null },
];

/*
 * ==========================================
 * CUPONES
 * ==========================================
 */
const CUPONES = [
  {
    codigo: "TUKI500",
    tipo: "FIJO",
    valor: 500,
    compraMinima: 7000,
    topeDescuento: null,
  },
  {
    codigo: "NOCHE10",
    tipo: "PORCENTAJE",
    valor: 10,
    compraMinima: 8000,
    topeDescuento: 800,
  },
];

async function respaldar() {
  const datos = {
    fecha: new Date().toISOString(),
    productos: await prisma.producto.findMany(),
    zonas: await prisma.zonaEnvio.findMany(),
    premios: await prisma.premio.findMany(),
    happyHours: await prisma.happyHour.findMany(),
    cupones: await prisma.cupon.findMany(),
  };

  const carpeta = path.join(process.cwd(), "backups");
  fs.mkdirSync(carpeta, { recursive: true });

  const archivo = path.join(
    carpeta,
    `relanzamiento-${datos.fecha.replace(/[:.]/g, "-")}.json`
  );

  fs.writeFileSync(archivo, JSON.stringify(datos, null, 2), "utf8");
  console.log(`Respaldo guardado en ${archivo}\n`);
}

async function productos() {
  console.log("PRODUCTOS DEL STOCK");

  const nombres = STOCK.map((p) => p.name);

  for (const item of STOCK) {
    const existente = await prisma.producto.findFirst({
      where: { name: item.name },
    });

    if (existente) {
      console.log(
        `  actualizar  ${item.name}: $${existente.price} → $${item.price}, stock ${existente.stock} → ${item.stock}${existente.activo ? "" : ", se activa"}`
      );

      if (APLICAR) {
        await prisma.producto.update({
          where: { id: existente.id },
          data: {
            price: item.price,
            stock: item.stock,
            activo: true,
            compareAtPrice: null,
          },
        });
      }
    } else if (item.nuevo) {
      console.log(
        `  crear       ${item.name}: $${item.price}, stock ${item.stock}`
      );

      if (APLICAR) {
        await prisma.producto.create({
          data: {
            name: item.name,
            price: item.price,
            stock: item.stock,
            activo: true,
            tags: [],
            ...item.nuevo,
          },
        });
      }
    } else {
      console.log(
        `  ⚠ NO EXISTE ${item.name} (revisar el nombre en la base)`
      );
    }
  }

  const otros = await prisma.producto.findMany({
    where: {
      name: { notIn: nombres },
      stock: { not: 0 },
    },
  });

  console.log(`\nOTROS PRODUCTOS → stock 0 (${otros.length})`);

  for (const p of otros) {
    console.log(`  ${p.name}: stock ${p.stock} → 0`);
  }

  if (APLICAR && otros.length > 0) {
    await prisma.producto.updateMany({
      where: {
        id: { in: otros.map((p) => p.id) },
      },
      data: { stock: 0 },
    });
  }
}

async function zonas() {
  console.log("\nZONAS DE ENVÍO");

  const lista = await prisma.zonaEnvio.findMany({
    orderBy: { orden: "asc" },
  });

  for (const zona of lista) {
    const precio = PRECIO_ZONA[zona.nombre] ?? zona.precio;
    const esA = zona.nombre === "Zona A";

    console.log(
      `  ${zona.nombre}: envío $${zona.precio} → $${precio}, mínimo $${zona.compraMinima} → $${COMPRA_MINIMA}${esA ? ", polígono ampliado" : ""}`
    );

    if (APLICAR) {
      await prisma.zonaEnvio.update({
        where: { id: zona.id },
        data: {
          precio,
          compraMinima: COMPRA_MINIMA,
          ...(esA
            ? { poligono: POLIGONO_ZONA_A, orden: 1 }
            : {}),
        },
      });
    }
  }
}

async function premios() {
  console.log("\nPREMIOS DE LA RULETA");

  const actuales = await prisma.premio.findMany();
  const usados = new Set<string>();

  for (const premio of PREMIOS) {
    const existente = actuales.find(
      (p) => p.tipo === premio.tipo && !usados.has(p.id)
    );

    console.log(
      `  ${existente ? "actualizar" : "crear     "} ${premio.nombre} (${premio.tipo}) → ${premio.probabilidad}%`
    );

    if (existente) {
      usados.add(existente.id);

      if (APLICAR) {
        await prisma.premio.update({
          where: { id: existente.id },
          data: { ...premio, activo: true },
        });
      }
    } else if (APLICAR) {
      await prisma.premio.create({
        data: { ...premio, activo: true },
      });
    }
  }

  const sobrantes = actuales.filter(
    (p) => !usados.has(p.id) && p.activo
  );

  for (const p of sobrantes) {
    console.log(`  desactivar ${p.nombre} (${p.tipo})`);
  }

  if (APLICAR && sobrantes.length > 0) {
    await prisma.premio.updateMany({
      where: { id: { in: sobrantes.map((p) => p.id) } },
      data: { activo: false },
    });
  }
}

async function happyHour() {
  console.log("\nHAPPY HOUR");

  const pruebas = await prisma.happyHour.findMany({
    where: {
      activo: true,
      titulo: { contains: "prueba", mode: "insensitive" },
    },
  });

  if (pruebas.length === 0) {
    console.log("  nada que desactivar");
  }

  for (const h of pruebas) {
    console.log(`  desactivar "${h.titulo}" (${h.tipo})`);
  }

  if (APLICAR && pruebas.length > 0) {
    await prisma.happyHour.updateMany({
      where: { id: { in: pruebas.map((h) => h.id) } },
      data: { activo: false },
    });
  }
}

async function cupones() {
  console.log("\nCUPONES");

  for (const cupon of CUPONES) {
    const existente = await prisma.cupon.findUnique({
      where: { codigo: cupon.codigo },
    });

    console.log(
      `  ${existente ? "actualizar" : "crear     "} ${cupon.codigo}: ${cupon.tipo === "FIJO" ? `$${cupon.valor}` : `${cupon.valor}%`} desde $${cupon.compraMinima}${cupon.topeDescuento ? `, tope $${cupon.topeDescuento}` : ""}`
    );

    if (!APLICAR) continue;

    if (existente) {
      await prisma.cupon.update({
        where: { id: existente.id },
        data: cupon,
      });
    } else {
      await prisma.cupon.create({
        data: { ...cupon, maxUsos: 100, activo: true },
      });
    }
  }
}

async function main() {
  console.log(
    APLICAR
      ? "=== APLICANDO CAMBIOS ===\n"
      : "=== VISTA PREVIA (no se cambia nada; usá --aplicar) ===\n"
  );

  if (APLICAR) {
    await respaldar();
  }

  await productos();
  await zonas();
  await premios();
  await happyHour();
  await cupones();

  console.log(APLICAR ? "\nListo." : "\nFin de la vista previa.");
}

main()
  .catch((error) => {
    console.error("Error en el relanzamiento:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
