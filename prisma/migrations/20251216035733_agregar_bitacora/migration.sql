-- CreateTable
CREATE TABLE "bitacora" (
    "id" SERIAL NOT NULL,
    "tabla" TEXT NOT NULL,
    "registro_id" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "campos_modificados" TEXT[],
    "usuario_id" INTEGER,
    "usuario_nombre" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "modulo" TEXT,
    "descripcion" TEXT,
    "metadata" JSONB,
    "fecha_hora" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bitacora_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bitacora_tabla_registro_id_idx" ON "bitacora"("tabla", "registro_id");

-- CreateIndex
CREATE INDEX "bitacora_usuario_id_idx" ON "bitacora"("usuario_id");

-- CreateIndex
CREATE INDEX "bitacora_fecha_hora_idx" ON "bitacora"("fecha_hora");

-- CreateIndex
CREATE INDEX "bitacora_tabla_fecha_hora_idx" ON "bitacora"("tabla", "fecha_hora");

-- CreateIndex
CREATE INDEX "bitacora_accion_idx" ON "bitacora"("accion");

-- AddForeignKey
ALTER TABLE "bitacora" ADD CONSTRAINT "bitacora_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("idusuario") ON DELETE SET NULL ON UPDATE CASCADE;
