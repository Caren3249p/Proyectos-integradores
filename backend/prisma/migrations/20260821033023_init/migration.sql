-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_github_username_key" ON "usuario"("github_username");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_plane_user_id_key" ON "usuario"("plane_user_id");
