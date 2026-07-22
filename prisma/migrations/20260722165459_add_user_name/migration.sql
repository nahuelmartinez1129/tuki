/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Pedido" ALTER COLUMN "metodoPago" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "nombre" TEXT,
ADD COLUMN     "ultimoIngreso" TIMESTAMP(3),
ALTER COLUMN "anonymousId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_phone_key" ON "Usuario"("phone");
