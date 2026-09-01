/*
  Warnings:

  - You are about to drop the `categoria_evaluacion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `evaluacion_detalle` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[id_criterio,nivel]` on the table `nivel_desempeno` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fecha_actualizacion` to the `criterio_rubrica` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TipoNodoRubrica" AS ENUM ('CORTE_ACADEMICO', 'ACTIVIDAD', 'CRITERIO_EVALUABLE');

-- DropForeignKey
ALTER TABLE "categoria_evaluacion" DROP CONSTRAINT "categoria_evaluacion_id_docente_fkey";

-- DropForeignKey
ALTER TABLE "categoria_evaluacion" DROP CONSTRAINT "categoria_evaluacion_id_padre_fkey";

-- DropForeignKey
ALTER TABLE "categoria_evaluacion" DROP CONSTRAINT "categoria_evaluacion_id_proyecto_fkey";

-- DropForeignKey
ALTER TABLE "evaluacion_detalle" DROP CONSTRAINT "evaluacion_detalle_id_categoria_fkey";

-- DropForeignKey
ALTER TABLE "evaluacion_detalle" DROP CONSTRAINT "evaluacion_detalle_id_proyecto_fkey";

-- AlterTable
ALTER TABLE "criterio_rubrica" ADD COLUMN     "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tipo" "TipoNodoRubrica" NOT NULL DEFAULT 'CRITERIO_EVALUABLE';

-- AlterTable
ALTER TABLE "nivel_desempeno" ALTER COLUMN "nivel" DROP DEFAULT;

-- DropTable
DROP TABLE "categoria_evaluacion";

-- DropTable
DROP TABLE "evaluacion_detalle";

-- CreateIndex
CREATE INDEX "criterio_rubrica_id_rubrica_idx" ON "criterio_rubrica"("id_rubrica");

-- CreateIndex
CREATE INDEX "criterio_rubrica_id_padre_idx" ON "criterio_rubrica"("id_padre");

-- CreateIndex
CREATE UNIQUE INDEX "nivel_desempeno_id_criterio_nivel_key" ON "nivel_desempeno"("id_criterio", "nivel");
