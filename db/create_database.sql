-- =============================================================================
-- Plataforma de Proyectos Integradores UPB
-- Script de creación de la base de datos (PostgreSQL)
-- Equivalente al esquema Prisma: backend/prisma/schema.prisma
--
-- Uso (psql):
--   psql -U postgres -f db/create_database.sql
--
-- Si la base ya existe y solo quieres recrear el esquema, conéctate a
-- Proyecto3 y ejecuta desde la sección "ESQUEMA".
-- =============================================================================

-- -----------------------------------------------------------------------------
-- BASE DE DATOS
-- -----------------------------------------------------------------------------
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'Proyecto3'
  AND pid <> pg_backend_pid();

DROP DATABASE IF EXISTS "Proyecto3";
CREATE DATABASE "Proyecto3"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8';

\connect Proyecto3

-- -----------------------------------------------------------------------------
-- ESQUEMA
-- -----------------------------------------------------------------------------
BEGIN;

DROP TABLE IF EXISTS "calificacion_criterio" CASCADE;
DROP TABLE IF EXISTS "evaluacion" CASCADE;
DROP TABLE IF EXISTS "nivel_desempeno" CASCADE;
DROP TABLE IF EXISTS "criterio_rubrica" CASCADE;
DROP TABLE IF EXISTS "rubrica" CASCADE;
DROP TABLE IF EXISTS "archivo" CASCADE;
DROP TABLE IF EXISTS "version_proyecto" CASCADE;
DROP TABLE IF EXISTS "repositorio" CASCADE;
DROP TABLE IF EXISTS "campo_tecnico" CASCADE;
DROP TABLE IF EXISTS "tarea_backlog" CASCADE;
DROP TABLE IF EXISTS "integrante_proyecto" CASCADE;
DROP TABLE IF EXISTS "proyecto" CASCADE;
DROP TABLE IF EXISTS "usuario" CASCADE;
DROP TYPE IF EXISTS "TipoNodoRubrica";

CREATE TYPE "TipoNodoRubrica" AS ENUM (
    'CORTE_ACADEMICO',
    'ACTIVIDAD',
    'CRITERIO_EVALUABLE'
);

CREATE TABLE "usuario" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "correo" VARCHAR(100) NOT NULL,
    "contraseña_hash" VARCHAR(255) NOT NULL,
    "rol" VARCHAR(20) NOT NULL,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "github_username" VARCHAR(100),
    "plane_user_id" VARCHAR(100),
    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_usuario")
);

CREATE TABLE "proyecto" (
    "id_proyecto" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "id_plane_proyecto" VARCHAR(100),
    "porcentaje_avance" INTEGER NOT NULL DEFAULT 0,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'borrador',
    "id_creador" INTEGER,
    "id_docente" INTEGER,
    CONSTRAINT "proyecto_pkey" PRIMARY KEY ("id_proyecto")
);

CREATE TABLE "tarea_backlog" (
    "id_tarea" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "id_plane_issue" VARCHAR(100) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'por_hacer',
    "fecha_ultimo_sync" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tarea_backlog_pkey" PRIMARY KEY ("id_tarea")
);

CREATE TABLE "integrante_proyecto" (
    "id_proyecto" INTEGER NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    CONSTRAINT "integrante_proyecto_pkey" PRIMARY KEY ("id_proyecto", "id_usuario")
);

CREATE TABLE "version_proyecto" (
    "id_version" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "numero" VARCHAR(20) NOT NULL,
    "es_final" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "version_proyecto_pkey" PRIMARY KEY ("id_version")
);

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

CREATE TABLE "repositorio" (
    "id_repositorio" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "es_privado" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "repositorio_pkey" PRIMARY KEY ("id_repositorio")
);

CREATE TABLE "rubrica" (
    "id_rubrica" SERIAL NOT NULL,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "id_docente" INTEGER NOT NULL,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "rubrica_pkey" PRIMARY KEY ("id_rubrica")
);

CREATE TABLE "criterio_rubrica" (
    "id_criterio" SERIAL NOT NULL,
    "id_rubrica" INTEGER NOT NULL,
    "id_padre" INTEGER,
    "nombre" VARCHAR(150) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "peso" DECIMAL(5, 2) NOT NULL,
    "tipo" "TipoNodoRubrica" NOT NULL DEFAULT 'CRITERIO_EVALUABLE',
    "es_hoja" BOOLEAN NOT NULL DEFAULT true,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_actualizacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "criterio_rubrica_pkey" PRIMARY KEY ("id_criterio")
);

CREATE TABLE "nivel_desempeno" (
    "id_nivel" SERIAL NOT NULL,
    "id_criterio" INTEGER NOT NULL,
    "nivel" INTEGER NOT NULL,
    "puntos" DECIMAL(4, 2) NOT NULL,
    "descripcion" TEXT NOT NULL,
    CONSTRAINT "nivel_desempeno_pkey" PRIMARY KEY ("id_nivel")
);

CREATE TABLE "evaluacion" (
    "id_evaluacion" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "id_rubrica" INTEGER NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "nota_final" DECIMAL(4, 2) NOT NULL,
    "retroalimentacion" TEXT NOT NULL,
    "estado" VARCHAR(20) NOT NULL DEFAULT 'borrador',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "evaluacion_pkey" PRIMARY KEY ("id_evaluacion")
);

CREATE TABLE "calificacion_criterio" (
    "id_calificacion" SERIAL NOT NULL,
    "id_evaluacion" INTEGER NOT NULL,
    "id_criterio" INTEGER NOT NULL,
    "nota" DECIMAL(4, 2) NOT NULL,
    CONSTRAINT "calificacion_criterio_pkey" PRIMARY KEY ("id_calificacion")
);

-- Índices únicos
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");
CREATE UNIQUE INDEX "usuario_github_username_key" ON "usuario"("github_username");
CREATE UNIQUE INDEX "usuario_plane_user_id_key" ON "usuario"("plane_user_id");
CREATE UNIQUE INDEX "proyecto_id_plane_proyecto_key" ON "proyecto"("id_plane_proyecto");
CREATE UNIQUE INDEX "tarea_backlog_id_proyecto_id_plane_issue_key" ON "tarea_backlog"("id_proyecto", "id_plane_issue");
CREATE UNIQUE INDEX "version_proyecto_id_proyecto_numero_key" ON "version_proyecto"("id_proyecto", "numero");
CREATE UNIQUE INDEX "campo_tecnico_id_proyecto_key" ON "campo_tecnico"("id_proyecto");
CREATE UNIQUE INDEX "repositorio_id_proyecto_key" ON "repositorio"("id_proyecto");
CREATE UNIQUE INDEX "nivel_desempeno_id_criterio_nivel_key" ON "nivel_desempeno"("id_criterio", "nivel");

-- Índices de búsqueda (jerarquía de rúbrica)
CREATE INDEX "criterio_rubrica_id_rubrica_idx" ON "criterio_rubrica"("id_rubrica");
CREATE INDEX "criterio_rubrica_id_padre_idx" ON "criterio_rubrica"("id_padre");

-- Claves foráneas
ALTER TABLE "proyecto"
    ADD CONSTRAINT "proyecto_id_creador_fkey"
    FOREIGN KEY ("id_creador") REFERENCES "usuario"("id_usuario")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "proyecto"
    ADD CONSTRAINT "proyecto_id_docente_fkey"
    FOREIGN KEY ("id_docente") REFERENCES "usuario"("id_usuario")
    ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "tarea_backlog"
    ADD CONSTRAINT "tarea_backlog_id_proyecto_fkey"
    FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "integrante_proyecto"
    ADD CONSTRAINT "integrante_proyecto_id_proyecto_fkey"
    FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "integrante_proyecto"
    ADD CONSTRAINT "integrante_proyecto_id_usuario_fkey"
    FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "version_proyecto"
    ADD CONSTRAINT "version_proyecto_id_proyecto_fkey"
    FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "archivo"
    ADD CONSTRAINT "archivo_id_version_fkey"
    FOREIGN KEY ("id_version") REFERENCES "version_proyecto"("id_version")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "campo_tecnico"
    ADD CONSTRAINT "campo_tecnico_id_proyecto_fkey"
    FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "repositorio"
    ADD CONSTRAINT "repositorio_id_proyecto_fkey"
    FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "rubrica"
    ADD CONSTRAINT "rubrica_id_docente_fkey"
    FOREIGN KEY ("id_docente") REFERENCES "usuario"("id_usuario")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "criterio_rubrica"
    ADD CONSTRAINT "criterio_rubrica_id_rubrica_fkey"
    FOREIGN KEY ("id_rubrica") REFERENCES "rubrica"("id_rubrica")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "criterio_rubrica"
    ADD CONSTRAINT "criterio_rubrica_id_padre_fkey"
    FOREIGN KEY ("id_padre") REFERENCES "criterio_rubrica"("id_criterio")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "nivel_desempeno"
    ADD CONSTRAINT "nivel_desempeno_id_criterio_fkey"
    FOREIGN KEY ("id_criterio") REFERENCES "criterio_rubrica"("id_criterio")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "evaluacion"
    ADD CONSTRAINT "evaluacion_id_docente_fkey"
    FOREIGN KEY ("id_docente") REFERENCES "usuario"("id_usuario")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "evaluacion"
    ADD CONSTRAINT "evaluacion_id_rubrica_fkey"
    FOREIGN KEY ("id_rubrica") REFERENCES "rubrica"("id_rubrica")
    ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "evaluacion"
    ADD CONSTRAINT "evaluacion_id_proyecto_fkey"
    FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "calificacion_criterio"
    ADD CONSTRAINT "calificacion_criterio_id_evaluacion_fkey"
    FOREIGN KEY ("id_evaluacion") REFERENCES "evaluacion"("id_evaluacion")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "calificacion_criterio"
    ADD CONSTRAINT "calificacion_criterio_id_criterio_fkey"
    FOREIGN KEY ("id_criterio") REFERENCES "criterio_rubrica"("id_criterio")
    ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
