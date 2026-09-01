/*
  Warnings:

  - Added the required column `id_proyecto` to the `evaluacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nota_final` to the `evaluacion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `retroalimentacion` to the `evaluacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "evaluacion" ADD COLUMN     "estado" VARCHAR(20) NOT NULL DEFAULT 'borrador',
ADD COLUMN     "id_proyecto" INTEGER NOT NULL,
ADD COLUMN     "nota_final" DECIMAL(4,2) NOT NULL,
ADD COLUMN     "retroalimentacion" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "proyecto" ADD COLUMN     "id_docente" INTEGER;

-- CreateTable
CREATE TABLE "calificacion_criterio" (
    "id_calificacion" SERIAL NOT NULL,
    "id_evaluacion" INTEGER NOT NULL,
    "id_criterio" INTEGER NOT NULL,
    "nota" DECIMAL(4,2) NOT NULL,

    CONSTRAINT "calificacion_criterio_pkey" PRIMARY KEY ("id_calificacion")
);

-- CreateTable
CREATE TABLE "categoria_evaluacion" (
    "id_categoria" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "id_padre" INTEGER,
    "id_docente" INTEGER NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "peso" DECIMAL(5,2),
    "es_hoja" BOOLEAN NOT NULL DEFAULT false,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "categoria_evaluacion_pkey" PRIMARY KEY ("id_categoria")
);

-- CreateTable
CREATE TABLE "evaluacion_detalle" (
    "id_detalle" SERIAL NOT NULL,
    "id_categoria" INTEGER NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "nota" DECIMAL(4,2),
    "retroalimentacion" TEXT,
    "fecha_calificacion" TIMESTAMP(3),

    CONSTRAINT "evaluacion_detalle_pkey" PRIMARY KEY ("id_detalle")
);

-- CreateIndex
CREATE UNIQUE INDEX "categoria_evaluacion_id_proyecto_nombre_key" ON "categoria_evaluacion"("id_proyecto", "nombre");

-- CreateIndex
CREATE UNIQUE INDEX "evaluacion_detalle_id_categoria_id_proyecto_key" ON "evaluacion_detalle"("id_categoria", "id_proyecto");

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion" ADD CONSTRAINT "evaluacion_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion_criterio" ADD CONSTRAINT "calificacion_criterio_id_evaluacion_fkey" FOREIGN KEY ("id_evaluacion") REFERENCES "evaluacion"("id_evaluacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calificacion_criterio" ADD CONSTRAINT "calificacion_criterio_id_criterio_fkey" FOREIGN KEY ("id_criterio") REFERENCES "criterio_rubrica"("id_criterio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_evaluacion" ADD CONSTRAINT "categoria_evaluacion_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_evaluacion" ADD CONSTRAINT "categoria_evaluacion_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categoria_evaluacion" ADD CONSTRAINT "categoria_evaluacion_id_padre_fkey" FOREIGN KEY ("id_padre") REFERENCES "categoria_evaluacion"("id_categoria") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_detalle" ADD CONSTRAINT "evaluacion_detalle_id_categoria_fkey" FOREIGN KEY ("id_categoria") REFERENCES "categoria_evaluacion"("id_categoria") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion_detalle" ADD CONSTRAINT "evaluacion_detalle_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;
