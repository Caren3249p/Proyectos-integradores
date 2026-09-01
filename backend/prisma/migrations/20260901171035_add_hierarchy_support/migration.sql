-- AlterTable
ALTER TABLE "criterio_rubrica" ADD COLUMN     "es_hoja" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "id_padre" INTEGER,
ADD COLUMN     "orden" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "nivel_desempeno" (
    "id_nivel" SERIAL NOT NULL,
    "id_criterio" INTEGER NOT NULL,
    "nivel" INTEGER NOT NULL DEFAULT 0,
    "puntos" DECIMAL(4,2) NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "nivel_desempeno_pkey" PRIMARY KEY ("id_nivel")
);

-- AddForeignKey
ALTER TABLE "criterio_rubrica" ADD CONSTRAINT "criterio_rubrica_id_padre_fkey" FOREIGN KEY ("id_padre") REFERENCES "criterio_rubrica"("id_criterio") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nivel_desempeno" ADD CONSTRAINT "nivel_desempeno_id_criterio_fkey" FOREIGN KEY ("id_criterio") REFERENCES "criterio_rubrica"("id_criterio") ON DELETE CASCADE ON UPDATE CASCADE;
