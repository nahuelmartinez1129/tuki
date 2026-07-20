import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.pedidoItem.deleteMany();

  await prisma.pedido.deleteMany();

  console.log(
    "Pedidos eliminados correctamente."
  );
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });