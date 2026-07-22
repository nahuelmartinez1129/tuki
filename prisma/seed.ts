import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { featuredProducts } from "@/lib/data/products";
const prisma = new PrismaClient();

async function main() {
  // Limpiar tablas para desarrollo
  await prisma.configuracion.deleteMany();
  await prisma.premio.deleteMany();
  await prisma.cupon.deleteMany();

  // Configuración
  await prisma.configuracion.create({
    data: {
      abierto: true,
      envio: 800,
      whatsapp: "5492291504531",
      nombreNegocio: "TUKI",
    },
  });

  // Premios
  await prisma.premio.createMany({
  data: [
    {
      nombre: "Caja Misteriosa 10%",
      tipo: "CAJA_10",
      valor: 10,
      probabilidad: 30,
    },
    {
      nombre: "10% OFF",
      tipo: "DESCUENTO",
      valor: 10,
      probabilidad: 25,
    },
    {
      nombre: "Sin Premio",
      tipo: "SIN_PREMIO",
      probabilidad: 20,
    },
    {
      nombre: "$1500 OFF",
      tipo: "CUPON_1500",
      valor: 1500,
      probabilidad: 15,
    },
    {
      nombre: "Envío Gratis",
      tipo: "ENVIO_GRATIS",
      probabilidad: 7,
    },
    {
      nombre: "Caramelos Gratis",
      tipo: "GOMITAS",
      probabilidad: 3,
    },
  ],
});
  // Cupones
  await prisma.cupon.createMany({
    data: [
      {
        codigo: "TUKI500",
        tipo: "FIJO",
        valor: 500,
        maxUsos: 100,
      },
      {
        codigo: "NOCHE10",
        tipo: "PORCENTAJE",
        valor: 10,
        maxUsos: 100,
      },
    ],
  });

  await prisma.happyHour.deleteMany();

await prisma.happyHour.createMany({
  data: [
    {
      titulo: "Hora Tuki",
      descripcion:
        "Envío gratis hasta las 22:30 hs.",
      tipo: "ENVIO_GRATIS",
    },
    {
      titulo: "Hora Tuki",
      descripcion:
        "10% de descuento en todo el pedido hasta las 22:30 hs.",
      tipo: "DESCUENTO",
      valor: 10,
    },
    {
      titulo: "Hora Tuki",
      descripcion:
        "Cupon de $1500 en tu pedido hasta las 22:30 hs.",
      tipo: "CUPON_1500",
      valor: 1500,
    },
    {
      titulo: "Hora Tuki",
      descripcion:
        "Te regalamos unas gomitas con tu compra hasta las 22:30 hs.",
      tipo: "GOMITAS",
    },
    {
      titulo: "Hora Tuki",
      descripcion:
        "10% OFF en Caja Misteriosa hasta las 22:30 hs.",
      tipo: "CAJA_10",
      valor: 10,
    },
  ],
});

await prisma.producto.deleteMany();

for (const product of featuredProducts) {
  await prisma.producto.create({
    data: {
      name: product.name,

      description:
        product.description,

      price:
        product.price,

      compareAtPrice:
        product.compareAtPrice,

      image:
        product.image,

      category:
        product.category,

      tags:
        product.tags ?? [],

      stock:
        product.stock ?? 20,

      activo: true,

      isCombo:
        product.isCombo ??
        false,

      orden: 0,
    },
  });
}


  console.log("Seed ejecutado correctamente.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });