require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const prisma = new PrismaClient();

async function main() {
  const zonas = await prisma.zonaEnvio.findMany({
    orderBy: {
      orden: "asc",
    },
  });

  fs.writeFileSync(
    "zonas-envio.json",
    JSON.stringify(zonas, null, 2),
    "utf8"
  );

  console.log(`Se exportaron ${zonas.length} zonas.`);
  console.log("Archivo creado: zonas-envio.json");
}

main()
  .catch((error) => {
    console.error("Error exportando zonas:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
