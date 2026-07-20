/*
  Warnings:

  - You are about to drop the column `aperturaFinSemana` on the `Configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `aperturaSemana` on the `Configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `cierreFinSemana` on the `Configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `cierreSemana` on the `Configuracion` table. All the data in the column will be lost.
  - You are about to drop the column `modoManual` on the `Configuracion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Configuracion" DROP COLUMN "aperturaFinSemana",
DROP COLUMN "aperturaSemana",
DROP COLUMN "cierreFinSemana",
DROP COLUMN "cierreSemana",
DROP COLUMN "modoManual";
