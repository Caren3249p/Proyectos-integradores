/*
  Warnings:

  - A unique constraint covering the columns `[id_actividad_proyecto]` on the table `entrega` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "entrega" ADD COLUMN     "id_actividad_proyecto" INTEGER,
ALTER COLUMN "id_entregable" DROP NOT NULL;

-- CreateTable
CREATE TABLE "actividad_entregable" (
    "id_actividad" SERIAL NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "fecha_limite" TIMESTAMP(3) NOT NULL,
    "tipo" "TipoEntregable" NOT NULL,
    "id_rubrica_docente" INTEGER NOT NULL,
    "id_rubrica_coevaluacion" INTEGER,
    "coevaluacion_activa" BOOLEAN NOT NULL DEFAULT false,
    "criterios_snapshot" JSONB NOT NULL,
    "estado" "EstadoEntregable" NOT NULL DEFAULT 'BORRADOR',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actividad_entregable_pkey" PRIMARY KEY ("id_actividad")
);

-- CreateTable
CREATE TABLE "actividad_proyecto" (
    "id_actividad_proyecto" SERIAL NOT NULL,
    "id_actividad" INTEGER NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "fecha_asignacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actividad_proyecto_pkey" PRIMARY KEY ("id_actividad_proyecto")
);

-- CreateIndex
CREATE INDEX "actividad_entregable_id_docente_estado_idx" ON "actividad_entregable"("id_docente", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "actividad_proyecto_id_actividad_id_proyecto_key" ON "actividad_proyecto"("id_actividad", "id_proyecto");

-- CreateIndex
CREATE UNIQUE INDEX "entrega_id_actividad_proyecto_key" ON "entrega"("id_actividad_proyecto");

-- AddForeignKey
ALTER TABLE "actividad_entregable" ADD CONSTRAINT "actividad_entregable_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad_entregable" ADD CONSTRAINT "actividad_entregable_id_rubrica_docente_fkey" FOREIGN KEY ("id_rubrica_docente") REFERENCES "rubrica"("id_rubrica") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad_entregable" ADD CONSTRAINT "actividad_entregable_id_rubrica_coevaluacion_fkey" FOREIGN KEY ("id_rubrica_coevaluacion") REFERENCES "rubrica"("id_rubrica") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad_proyecto" ADD CONSTRAINT "actividad_proyecto_id_actividad_fkey" FOREIGN KEY ("id_actividad") REFERENCES "actividad_entregable"("id_actividad") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actividad_proyecto" ADD CONSTRAINT "actividad_proyecto_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entrega" ADD CONSTRAINT "entrega_id_actividad_proyecto_fkey" FOREIGN KEY ("id_actividad_proyecto") REFERENCES "actividad_proyecto"("id_actividad_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;
