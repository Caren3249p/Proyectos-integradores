/*
  Warnings:

  - A unique constraint covering the columns `[id_entrega]` on the table `evaluacion` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TipoRubrica" AS ENUM ('DOCENTE', 'COEVALUACION');

-- CreateEnum
CREATE TYPE "TipoEntregable" AS ENUM ('INDIVIDUAL', 'GRUPAL');

-- CreateEnum
CREATE TYPE "EstadoEntregable" AS ENUM ('BORRADOR', 'PUBLICADO', 'CERRADO');

-- CreateEnum
CREATE TYPE "EstadoEntrega" AS ENUM ('PENDIENTE', 'ENTREGADA');

-- CreateEnum
CREATE TYPE "EstadoCoevaluacion" AS ENUM ('PENDIENTE', 'ENVIADA');

-- AlterTable
ALTER TABLE "evaluacion" ADD COLUMN     "id_entrega" INTEGER;

-- AlterTable
ALTER TABLE "rubrica" ADD COLUMN     "tipo" "TipoRubrica" NOT NULL DEFAULT 'DOCENTE';

-- CreateTable
CREATE TABLE "entregable" (
    "id_entregable" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_limite" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoEntregable" NOT NULL,
    "id_rubrica_docente" INTEGER NOT NULL,
    "id_rubrica_coevaluacion" INTEGER,
    "coevaluacion_activa" BOOLEAN NOT NULL DEFAULT false,
    "estado" "EstadoEntregable" NOT NULL DEFAULT 'BORRADOR',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "entregable_pkey" PRIMARY KEY ("id_entregable")
);

-- CreateTable
CREATE TABLE "entrega" (
    "id_entrega" SERIAL NOT NULL,
    "id_entregable" INTEGER NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "id_usuario" INTEGER,
    "identificador" VARCHAR(80) NOT NULL,
    "fecha_entrega" TIMESTAMP(3),
    "entregada_a_tiempo" BOOLEAN,
    "estado" "EstadoEntrega" NOT NULL DEFAULT 'PENDIENTE',
    "nota_base" DECIMAL(5,2),
    "nota_final" DECIMAL(5,2),

    CONSTRAINT "entrega_pkey" PRIMARY KEY ("id_entrega")
);

-- CreateTable
CREATE TABLE "entrega_participante" (
    "id_entrega" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "entrega_participante_pkey" PRIMARY KEY ("id_entrega","id_usuario")
);

-- CreateTable
CREATE TABLE "archivo_entrega" (
    "id_archivo_entrega" SERIAL NOT NULL,
    "id_entrega" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "nombre_fisico" VARCHAR(255) NOT NULL,
    "ruta" VARCHAR(500) NOT NULL,
    "extension" VARCHAR(10) NOT NULL,
    "tamano" INTEGER NOT NULL,
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivo_entrega_pkey" PRIMARY KEY ("id_archivo_entrega")
);

-- CreateTable
CREATE TABLE "coevaluacion" (
    "id_coevaluacion" SERIAL NOT NULL,
    "id_entrega" INTEGER NOT NULL,
    "id_evaluador" INTEGER NOT NULL,
    "id_evaluado" INTEGER NOT NULL,
    "estado" "EstadoCoevaluacion" NOT NULL DEFAULT 'PENDIENTE',
    "observacion" TEXT,
    "fecha_envio" TIMESTAMP(3),

    CONSTRAINT "coevaluacion_pkey" PRIMARY KEY ("id_coevaluacion")
);

-- CreateTable
CREATE TABLE "coevaluacion_criterio" (
    "id_coevaluacion" INTEGER NOT NULL,
    "id_criterio" INTEGER NOT NULL,
    "calificacion_base" INTEGER NOT NULL,

    CONSTRAINT "coevaluacion_criterio_pkey" PRIMARY KEY ("id_coevaluacion","id_criterio")
);

-- CreateTable
CREATE TABLE "resultado_coevaluacion" (
    "id_resultado" SERIAL NOT NULL,
    "id_entrega" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "total_coevaluacion" DECIMAL(5,2) NOT NULL,
    "nota_base" DECIMAL(5,2),
    "nota_final" DECIMAL(5,2),
    "actualizado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resultado_coevaluacion_pkey" PRIMARY KEY ("id_resultado")
);

-- CreateIndex
CREATE INDEX "entregable_id_proyecto_estado_idx" ON "entregable"("id_proyecto", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "entrega_identificador_key" ON "entrega"("identificador");

-- CreateIndex
CREATE INDEX "entrega_id_entregable_estado_idx" ON "entrega"("id_entregable", "estado");

-- CreateIndex
CREATE INDEX "archivo_entrega_id_entrega_idx" ON "archivo_entrega"("id_entrega");

-- CreateIndex
CREATE INDEX "coevaluacion_id_entrega_estado_idx" ON "coevaluacion"("id_entrega", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "coevaluacion_id_entrega_id_evaluador_id_evaluado_key" ON "coevaluacion"("id_entrega", "id_evaluador", "id_evaluado");

-- CreateIndex
CREATE UNIQUE INDEX "resultado_coevaluacion_id_entrega_id_usuario_key" ON "resultado_coevaluacion"("id_entrega", "id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "evaluacion_id_entrega_key" ON "evaluacion"("id_entrega");

-- AddForeignKey
ALTER TABLE "evaluacion" ADD CONSTRAINT "evaluacion_id_entrega_fkey" FOREIGN KEY ("id_entrega") REFERENCES "entrega"("id_entrega") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregable" ADD CONSTRAINT "entregable_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregable" ADD CONSTRAINT "entregable_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregable" ADD CONSTRAINT "entregable_id_rubrica_docente_fkey" FOREIGN KEY ("id_rubrica_docente") REFERENCES "rubrica"("id_rubrica") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entregable" ADD CONSTRAINT "entregable_id_rubrica_coevaluacion_fkey" FOREIGN KEY ("id_rubrica_coevaluacion") REFERENCES "rubrica"("id_rubrica") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_id_entregable_fkey" FOREIGN KEY ("id_entregable") REFERENCES "entregable"("id_entregable") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega_participante" ADD CONSTRAINT "entrega_participante_id_entrega_fkey" FOREIGN KEY ("id_entrega") REFERENCES "entrega"("id_entrega") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega_participante" ADD CONSTRAINT "entrega_participante_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo_entrega" ADD CONSTRAINT "archivo_entrega_id_entrega_fkey" FOREIGN KEY ("id_entrega") REFERENCES "entrega"("id_entrega") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coevaluacion" ADD CONSTRAINT "coevaluacion_id_entrega_fkey" FOREIGN KEY ("id_entrega") REFERENCES "entrega"("id_entrega") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coevaluacion" ADD CONSTRAINT "coevaluacion_id_evaluador_fkey" FOREIGN KEY ("id_evaluador") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coevaluacion" ADD CONSTRAINT "coevaluacion_id_evaluado_fkey" FOREIGN KEY ("id_evaluado") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coevaluacion_criterio" ADD CONSTRAINT "coevaluacion_criterio_id_coevaluacion_fkey" FOREIGN KEY ("id_coevaluacion") REFERENCES "coevaluacion"("id_coevaluacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coevaluacion_criterio" ADD CONSTRAINT "coevaluacion_criterio_id_criterio_fkey" FOREIGN KEY ("id_criterio") REFERENCES "criterio_rubrica"("id_criterio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultado_coevaluacion" ADD CONSTRAINT "resultado_coevaluacion_id_entrega_fkey" FOREIGN KEY ("id_entrega") REFERENCES "entrega"("id_entrega") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resultado_coevaluacion" ADD CONSTRAINT "resultado_coevaluacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
