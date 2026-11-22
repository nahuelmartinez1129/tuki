-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "latitud" DOUBLE PRECISION,
ADD COLUMN     "longitud" DOUBLE PRECISION;

-- CreateIndex
CREATE INDEX "Pedido_telefono_idx" ON "Pedido"("telefono");
