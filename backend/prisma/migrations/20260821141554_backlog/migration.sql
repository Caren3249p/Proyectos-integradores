-- CreateTable
CREATE TABLE "proyecto" (
    "id_proyecto" SERIAL NOT NULL,
    "titulo" VARCHAR(150) NOT NULL,
    "descripcion" TEXT,
    "id_plane_proyecto" VARCHAR(100),
    "porcentaje_avance" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "proyecto_pkey" PRIMARY KEY ("id_proyecto")
);

-- CreateTable
CREATE TABLE "tarea_backlog" (
    "id_tarea" SERIAL NOT NULL,
    "id_proyecto" INTEGER NOT NULL,
    "id_plane_issue" VARCHAR(100) NOT NULL,
    "titulo" VARCHAR(255) NOT NULL,
    "estado" VARCHAR(30) NOT NULL DEFAULT 'por_hacer',
    "fecha_ultimo_sync" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tarea_backlog_pkey" PRIMARY KEY ("id_tarea")
);

-- CreateIndex
CREATE UNIQUE INDEX "proyecto_id_plane_proyecto_key" ON "proyecto"("id_plane_proyecto");

-- CreateIndex
CREATE UNIQUE INDEX "tarea_backlog_id_proyecto_id_plane_issue_key" ON "tarea_backlog"("id_proyecto", "id_plane_issue");

-- AddForeignKey
ALTER TABLE "tarea_backlog" ADD CONSTRAINT "tarea_backlog_id_proyecto_fkey" FOREIGN KEY ("id_proyecto") REFERENCES "proyecto"("id_proyecto") ON DELETE CASCADE ON UPDATE CASCADE;
