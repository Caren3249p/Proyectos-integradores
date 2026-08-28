-- AlterTable
ALTER TABLE "proyecto" ADD COLUMN     "estado" VARCHAR(20) NOT NULL DEFAULT 'borrador',
ADD COLUMN     "id_creador" INTEGER;

-- CreateTable
CREATE TABLE "integrante_proyecto" (
    "id_proyecto" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,

    CONSTRAINT "integrante_proyecto_pkey" PRIMARY KEY ("id_proyecto","id_usuario")
);

-- CreateTable
CREATE TABLE "version_proyecto" (
    "id_version" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "es_final" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "version_proyecto_pkey" PRIMARY KEY ("id_version")
);

-- CreateTable
CREATE TABLE "archivo" (
    "id_archivo" SERIAL NOT NULL,
    "id_version" INTEGER NOT NULL,
    "nombre" VARCHAR(255) NOT NULL,
    "nombre_fisico" VARCHAR(255) NOT NULL,
    "ruta" VARCHAR(500) NOT NULL,
    "extension" VARCHAR(10) NOT NULL,
    "tamano" INTEGER NOT NULL,
    "tipo" VARCHAR(30),
    "fecha_subida" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "archivo_pkey" PRIMARY KEY ("id_archivo")
);

-- CreateTable
CREATE TABLE "campo_tecnico" (
    "id_campos_tecnicos" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "lenguaje_principal" TEXT,
    "frameworks" TEXT,
    "base_datos" TEXT,
    "es_movil" BOOLEAN,
    "entorno_despliegue" TEXT,

    CONSTRAINT "campo_tecnico_pkey" PRIMARY KEY ("id_campos_tecnicos")
);

-- CreateTable
CREATE TABLE "repositorio" (
    "id_repositorio" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "es_privado" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "repositorio_pkey" PRIMARY KEY ("id_repositorio")
);

-- CreateTable
CREATE TABLE "rubrica" (
    "id_rubrica" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "id_docente" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rubrica_pkey" PRIMARY KEY ("id_rubrica")
);

-- CreateTable
CREATE TABLE "criterio_rubrica" (
    "id_criterio" SERIAL NOT NULL,
    "id_rubrica" INTEGER NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "peso" DECIMAL(5,2) NOT NULL,

    CONSTRAINT "criterio_rubrica_pkey" PRIMARY KEY ("id_criterio")
);

-- CreateTable
CREATE TABLE "evaluacion" (
    "id_evaluacion" SERIAL NOT NULL,
    "id_rubrica" INTEGER NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evaluacion_pkey" PRIMARY KEY ("id_evaluacion")
);

-- CreateIndex
CREATE UNIQUE INDEX "version_proyecto_id_proyecto_numero_key" ON "version_proyecto"("id_proyecto", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "campo_tecnico_id_proyecto_key" ON "campo_tecnico"("id_proyecto");

-- CreateIndex
CREATE UNIQUE INDEX "repositorio_id_proyecto_key" ON "repositorio"("id_proyecto");

-- AddForeignKey
ALTER TABLE "proyecto" ADD CONSTRAINT "proyecto_id_creador_fkey" FOREIGN KEY ("id_creador") REFERENCES "usuario"("id_usuario") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrante_proyecto" ADD CONSTRAINT "integrante_proyecto_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrante_proyecto" ADD CONSTRAINT "integrante_proyecto_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version_proyecto" ADD CONSTRAINT "version_proyecto_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "archivo" ADD CONSTRAINT "archivo_id_version_fkey" FOREIGN KEY ("id_version") REFERENCES "version_proyecto"("id_version") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campo_tecnico" ADD CONSTRAINT "campo_tecnico_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repositorio" ADD CONSTRAINT "repositorio_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rubrica" ADD CONSTRAINT "rubrica_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "criterio_rubrica" ADD CONSTRAINT "criterio_rubrica_id_rubrica_fkey" FOREIGN KEY ("id_rubrica") REFERENCES "rubrica"("id_rubrica") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion" ADD CONSTRAINT "evaluacion_id_rubrica_fkey" FOREIGN KEY ("id_rubrica") REFERENCES "rubrica"("id_rubrica") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evaluacion" ADD CONSTRAINT "evaluacion_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "usuario"("id_usuario") ON DELETE RESTRICT ON UPDATE CASCADE;
