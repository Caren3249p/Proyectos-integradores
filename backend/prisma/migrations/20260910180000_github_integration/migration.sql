ALTER TABLE "usuario"
ADD COLUMN "github_user_id" VARCHAR(100),
ADD COLUMN "github_access_token_encrypted" TEXT,
ADD COLUMN "github_connected_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "usuario_github_user_id_key" ON "usuario"("github_user_id");

ALTER TABLE "repositorio"
ADD COLUMN "github_repo_id" VARCHAR(100),
ADD COLUMN "github_owner" VARCHAR(100),
ADD COLUMN "github_name" VARCHAR(150),
ADD COLUMN "origen" VARCHAR(30) NOT NULL DEFAULT 'manual',
ADD COLUMN "fecha_enlace" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "repositorio_github_repo_id_key" ON "repositorio"("github_repo_id");

CREATE TABLE "github_oauth_state" (
  "id" SERIAL NOT NULL,
  "state" VARCHAR(128) NOT NULL,
  "id_usuario" INTEGER NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "github_oauth_state_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "github_oauth_state_state_key" ON "github_oauth_state"("state");
CREATE INDEX "github_oauth_state_expires_at_idx" ON "github_oauth_state"("expires_at");
ALTER TABLE "github_oauth_state" ADD CONSTRAINT "github_oauth_state_id_usuario_fkey"
  FOREIGN KEY ("id_usuario") REFERENCES "usuario"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;
