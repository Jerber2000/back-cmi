-- CreateTable
CREATE TABLE "permiso" (
    "idpermiso" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),
    "ruta" VARCHAR(100) NOT NULL,
    "icono" VARCHAR(50),
    "orden" INTEGER DEFAULT 0,

    CONSTRAINT "permiso_pkey" PRIMARY KEY ("idpermiso")
);

-- CreateTable
CREATE TABLE "rol_permiso" (
    "fkrol" INTEGER NOT NULL,
    "fkpermiso" INTEGER NOT NULL,

    CONSTRAINT "rol_permiso_pkey" PRIMARY KEY ("fkrol","fkpermiso")
);

-- CreateIndex
CREATE UNIQUE INDEX "permiso_ruta_key" ON "permiso"("ruta");

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_fkrol_fkey" FOREIGN KEY ("fkrol") REFERENCES "rol"("idrol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_permiso" ADD CONSTRAINT "rol_permiso_fkpermiso_fkey" FOREIGN KEY ("fkpermiso") REFERENCES "permiso"("idpermiso") ON DELETE CASCADE ON UPDATE CASCADE;
