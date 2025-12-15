/*
  Warnings:

  - The primary key for the `usuario` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `activo` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `pass` on the `usuario` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `usuario` table. All the data in the column will be lost.
  - You are about to alter the column `usuario` on the `usuario` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(20)`.
  - A unique constraint covering the columns `[usuario]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[correo]` on the table `usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellidos` to the `usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clave` to the `usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `correo` to the `usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechanacimiento` to the `usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fkrol` to the `usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombres` to the `usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuariocreacion` to the `usuario` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "usuario_email_key";

-- AlterTable
ALTER TABLE "usuario" DROP CONSTRAINT "usuario_pkey",
DROP COLUMN "activo",
DROP COLUMN "createdAt",
DROP COLUMN "email",
DROP COLUMN "id",
DROP COLUMN "nombre",
DROP COLUMN "pass",
DROP COLUMN "updatedAt",
ADD COLUMN     "apellidos" VARCHAR(100) NOT NULL,
ADD COLUMN     "cambiarclave" BOOLEAN DEFAULT false,
ADD COLUMN     "clave" VARCHAR(255) NOT NULL,
ADD COLUMN     "correo" VARCHAR(150) NOT NULL,
ADD COLUMN     "estado" SMALLINT DEFAULT 1,
ADD COLUMN     "extension" VARCHAR(10),
ADD COLUMN     "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fechamodificacion" TIMESTAMP(6),
ADD COLUMN     "fechanacimiento" DATE NOT NULL,
ADD COLUMN     "fkclinica" INTEGER,
ADD COLUMN     "fkrol" INTEGER NOT NULL,
ADD COLUMN     "idusuario" SERIAL NOT NULL,
ADD COLUMN     "last_login_timestamp" BIGINT,
ADD COLUMN     "nombrecontactoemergencia" VARCHAR(150),
ADD COLUMN     "nombres" VARCHAR(100) NOT NULL,
ADD COLUMN     "observaciones" TEXT,
ADD COLUMN     "profesion" VARCHAR(100),
ADD COLUMN     "puesto" VARCHAR(100),
ADD COLUMN     "rutafotoperfil" TEXT,
ADD COLUMN     "telefonoemergencia" VARCHAR(20),
ADD COLUMN     "telefonopersonal" VARCHAR(20),
ADD COLUMN     "telinstitucional" VARCHAR(20),
ADD COLUMN     "usuariocreacion" VARCHAR(100) NOT NULL,
ADD COLUMN     "usuariomodificacion" VARCHAR(100),
ALTER COLUMN "usuario" SET DATA TYPE VARCHAR(20),
ADD CONSTRAINT "usuario_pkey" PRIMARY KEY ("idusuario");

-- CreateTable
CREATE TABLE "agenda" (
    "idagenda" SERIAL NOT NULL,
    "fkusuario" INTEGER NOT NULL,
    "fkpaciente" INTEGER NOT NULL,
    "fechaatencion" DATE NOT NULL,
    "horaatencion" TIME(6) NOT NULL,
    "comentario" TEXT,
    "transporte" SMALLINT DEFAULT 0,
    "fechatransporte" DATE,
    "horariotransporte" TIME(6),
    "usuariocreacion" VARCHAR(100) NOT NULL,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuariomodificacion" VARCHAR(100),
    "fechamodificacion" TIMESTAMP(6),
    "estado" SMALLINT DEFAULT 1,
    "direccion" TEXT DEFAULT 'Dirección no especificada',
    "fkagenda_recurrente" INTEGER,
    "es_recurrente" BOOLEAN DEFAULT false,

    CONSTRAINT "agenda_pkey" PRIMARY KEY ("idagenda")
);

-- CreateTable
CREATE TABLE "agenda_recurrente" (
    "idagenda_recurrente" SERIAL NOT NULL,
    "fkusuario" INTEGER NOT NULL,
    "fkpaciente" INTEGER NOT NULL,
    "horaatencion" TIME(6) NOT NULL,
    "comentario" TEXT,
    "transporte" SMALLINT DEFAULT 0,
    "direccion" VARCHAR(255),
    "tipo_recurrencia" VARCHAR(20) NOT NULL,
    "intervalo" INTEGER DEFAULT 1,
    "dias_semana" VARCHAR(50),
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE,
    "numero_ocurrencias" INTEGER,
    "usuariocreacion" VARCHAR(100) NOT NULL,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuariomodificacion" VARCHAR(100),
    "fechamodificacion" TIMESTAMP(6),
    "estado" SMALLINT DEFAULT 1,

    CONSTRAINT "agenda_recurrente_pkey" PRIMARY KEY ("idagenda_recurrente")
);

-- CreateTable
CREATE TABLE "clinica" (
    "idclinica" SERIAL NOT NULL,
    "nombreclinica" VARCHAR(200) NOT NULL,
    "usuariocreacion" VARCHAR(100) NOT NULL,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuariomodificacion" VARCHAR(100),
    "fechamodificacion" TIMESTAMP(6),
    "estado" SMALLINT DEFAULT 1,

    CONSTRAINT "clinica_pkey" PRIMARY KEY ("idclinica")
);

-- CreateTable
CREATE TABLE "detalledocumento" (
    "iddocumento" SERIAL NOT NULL,
    "nombredocumento" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "rutadocumento" TEXT NOT NULL,
    "usuariocreacion" VARCHAR(100) NOT NULL,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuariomodificacion" VARCHAR(100),
    "fechamodificacion" TIMESTAMP(6),
    "estado" SMALLINT DEFAULT 1,
    "fkclinica" INTEGER,

    CONSTRAINT "detalledocumento_pkey" PRIMARY KEY ("iddocumento")
);

-- CreateTable
CREATE TABLE "detallehistorialclinico" (
    "idhistorial" SERIAL NOT NULL,
    "fkpaciente" INTEGER NOT NULL,
    "fkusuario" INTEGER NOT NULL,
    "fkclinica" INTEGER,
    "fecha" DATE NOT NULL,
    "recordatorio" TEXT,
    "notaconsulta" TEXT,
    "motivoconsulta" TEXT,
    "evolucion" TEXT,
    "diagnosticotratamiento" TEXT,
    "usuariocreacion" VARCHAR(100) NOT NULL,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuariomodificacion" VARCHAR(100),
    "fechamodificacion" TIMESTAMP(6),
    "estado" SMALLINT DEFAULT 1,
    "rutahistorialclinico" TEXT,

    CONSTRAINT "detallehistorialclinico_pkey" PRIMARY KEY ("idhistorial")
);

-- CreateTable
CREATE TABLE "detallereferirpaciente" (
    "idrefpaciente" SERIAL NOT NULL,
    "fkusuario" INTEGER NOT NULL,
    "fkpaciente" INTEGER NOT NULL,
    "fkexpediente" INTEGER NOT NULL,
    "fkclinica" INTEGER NOT NULL,
    "comentario" TEXT,
    "confirmacion1" SMALLINT DEFAULT 0,
    "usuarioconfirma1" VARCHAR(100),
    "confirmacion2" SMALLINT DEFAULT 0,
    "usuarioconfirma2" VARCHAR(100),
    "confirmacion3" SMALLINT DEFAULT 0,
    "usuarioconfirma3" VARCHAR(100),
    "confirmacion4" SMALLINT DEFAULT 0,
    "usuarioconfirma4" VARCHAR(100),
    "usuariocreacion" VARCHAR(100) NOT NULL,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuariomodificacion" VARCHAR(100),
    "fechamodificacion" TIMESTAMP(6),
    "estado" SMALLINT DEFAULT 1,
    "fkusuariodestino" INTEGER,
    "rutadocumentoinicial" TEXT,
    "rutadocumentofinal" TEXT,

    CONSTRAINT "detallereferirpaciente_pkey" PRIMARY KEY ("idrefpaciente")
);

-- CreateTable
CREATE TABLE "expediente" (
    "idexpediente" SERIAL NOT NULL,
    "numeroexpediente" VARCHAR(50) NOT NULL,
    "historiaenfermedad" TEXT,
    "antmedico" TEXT,
    "antmedicamento" TEXT,
    "anttraumaticos" TEXT,
    "antfamiliar" TEXT,
    "antalergico" TEXT,
    "antmedicamentos" TEXT,
    "antsustancias" TEXT,
    "antintolerantelactosa" SMALLINT DEFAULT 0,
    "antfisoinmunizacion" TEXT,
    "antfisocrecimiento" TEXT,
    "antfisohabitos" TEXT,
    "antfisoalimentos" TEXT,
    "gineobsprenatales" TEXT,
    "gineobsnatales" TEXT,
    "gineobspostnatales" TEXT,
    "gineobsgestas" INTEGER,
    "gineobspartos" INTEGER,
    "gineobsabortos" INTEGER,
    "gineobscesareas" INTEGER,
    "gineobshv" TEXT,
    "gineobsmh" TEXT,
    "gineobsfur" DATE,
    "gineobsciclos" TEXT,
    "gineobsmenarquia" TEXT,
    "examenfistc" DECIMAL(5,2),
    "examenfispa" VARCHAR(20),
    "examenfisfc" INTEGER,
    "examenfisfr" INTEGER,
    "examenfissao2" DECIMAL(5,2),
    "examenfispeso" DECIMAL(6,2),
    "examenfistalla" DECIMAL(5,2),
    "examenfisimc" DECIMAL(5,2),
    "examenfisgmt" TEXT,
    "usuariocreacion" VARCHAR(100) NOT NULL,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuariomodificacion" VARCHAR(100),
    "fechamodificacion" TIMESTAMP(6),
    "estado" SMALLINT DEFAULT 1,
    "fkpaciente" INTEGER,

    CONSTRAINT "expediente_pkey" PRIMARY KEY ("idexpediente")
);

-- CreateTable
CREATE TABLE "inventariomedico" (
    "idmedicina" SERIAL NOT NULL,
    "fkusuario" INTEGER NOT NULL,
    "nombre" VARCHAR(200) NOT NULL,
    "descripcion" TEXT,
    "unidades" INTEGER DEFAULT 0,
    "precio" DECIMAL(10,2),
    "observaciones" TEXT,
    "fechaingreso" DATE,
    "fechavencimiento" DATE,
    "usuariocreacion" VARCHAR(100) NOT NULL,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuariomodificacion" VARCHAR(100),
    "fechamodificacion" TIMESTAMP(6),
    "estado" SMALLINT DEFAULT 1,
    "codigoproducto" VARCHAR(50),

    CONSTRAINT "inventariomedico_pkey" PRIMARY KEY ("idmedicina")
);

-- CreateTable
CREATE TABLE "paciente" (
    "idpaciente" SERIAL NOT NULL,
    "nombres" VARCHAR(100) NOT NULL,
    "apellidos" VARCHAR(100) NOT NULL,
    "cui" VARCHAR(20) NOT NULL,
    "fechanacimiento" DATE NOT NULL,
    "genero" CHAR(1) NOT NULL,
    "tipoconsulta" VARCHAR(100),
    "tipodiscapacidad" VARCHAR(150),
    "telefonopersonal" VARCHAR(20),
    "nombrecontactoemergencia" VARCHAR(150),
    "telefonoemergencia" VARCHAR(20),
    "nombreencargado" VARCHAR(150),
    "dpiencargado" VARCHAR(20),
    "telefonoencargado" VARCHAR(20),
    "municipio" VARCHAR(100),
    "aldea" VARCHAR(100),
    "direccion" TEXT,
    "rutafotoperfil" TEXT,
    "rutafotoencargado" TEXT,
    "rutacartaautorizacion" TEXT,
    "usuariocreacion" VARCHAR(100) NOT NULL,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuariomodificacion" VARCHAR(100),
    "fechamodificacion" TIMESTAMP(6),
    "estado" SMALLINT DEFAULT 1,
    "fkclinica" INTEGER,

    CONSTRAINT "paciente_pkey" PRIMARY KEY ("idpaciente")
);

-- CreateTable
CREATE TABLE "rol" (
    "idrol" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" TEXT,
    "usuariocreacion" VARCHAR(100) NOT NULL,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuariomodificacion" VARCHAR(100),
    "fechamodificacion" TIMESTAMP(6),
    "estado" SMALLINT DEFAULT 1,

    CONSTRAINT "rol_pkey" PRIMARY KEY ("idrol")
);

-- CreateTable
CREATE TABLE "salidasinventario" (
    "idsalida" SERIAL NOT NULL,
    "fkmedicina" INTEGER NOT NULL,
    "fkusuario" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" VARCHAR(200),
    "destino" VARCHAR(200),
    "observaciones" TEXT,
    "fechasalida" DATE NOT NULL,
    "usuariocreacion" VARCHAR(100) NOT NULL,
    "fechacreacion" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "usuariomodificacion" VARCHAR(100),
    "fechamodificacion" TIMESTAMP(6),
    "estado" SMALLINT DEFAULT 1,

    CONSTRAINT "salidasinventario_pkey" PRIMARY KEY ("idsalida")
);

-- CreateIndex
CREATE INDEX "idx_agenda_recurrente" ON "agenda"("fkagenda_recurrente");

-- CreateIndex
CREATE INDEX "idx_agenda_recurrente_fecha" ON "agenda_recurrente"("fecha_inicio", "fecha_fin");

-- CreateIndex
CREATE INDEX "idx_agenda_recurrente_paciente" ON "agenda_recurrente"("fkpaciente");

-- CreateIndex
CREATE INDEX "idx_historialclinico_fkclinica" ON "detallehistorialclinico"("fkclinica");

-- CreateIndex
CREATE UNIQUE INDEX "expediente_numeroexpediente_key" ON "expediente"("numeroexpediente");

-- CreateIndex
CREATE INDEX "idx_expediente_fkpaciente" ON "expediente"("fkpaciente");

-- CreateIndex
CREATE UNIQUE INDEX "inventariomedico_codigoproducto_key" ON "inventariomedico"("codigoproducto");

-- CreateIndex
CREATE UNIQUE INDEX "paciente_cui_key" ON "paciente"("cui");

-- CreateIndex
CREATE INDEX "idx_paciente_fkclinica" ON "paciente"("fkclinica");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_usuario_key" ON "usuario"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "fk_agenda_paciente" FOREIGN KEY ("fkpaciente") REFERENCES "paciente"("idpaciente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "fk_agenda_recurrente" FOREIGN KEY ("fkagenda_recurrente") REFERENCES "agenda_recurrente"("idagenda_recurrente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agenda" ADD CONSTRAINT "fk_agenda_usuario" FOREIGN KEY ("fkusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agenda_recurrente" ADD CONSTRAINT "fk_agenda_recurrente_paciente" FOREIGN KEY ("fkpaciente") REFERENCES "paciente"("idpaciente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "agenda_recurrente" ADD CONSTRAINT "fk_agenda_recurrente_usuario" FOREIGN KEY ("fkusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detalledocumento" ADD CONSTRAINT "fk_detalledocumento_clinica" FOREIGN KEY ("fkclinica") REFERENCES "clinica"("idclinica") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallehistorialclinico" ADD CONSTRAINT "fk_historial_paciente" FOREIGN KEY ("fkpaciente") REFERENCES "paciente"("idpaciente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallehistorialclinico" ADD CONSTRAINT "fk_historial_usuario" FOREIGN KEY ("fkusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallehistorialclinico" ADD CONSTRAINT "fk_historial_clinica" FOREIGN KEY ("fkclinica") REFERENCES "clinica"("idclinica") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallereferirpaciente" ADD CONSTRAINT "fk_referir_clinica" FOREIGN KEY ("fkclinica") REFERENCES "clinica"("idclinica") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallereferirpaciente" ADD CONSTRAINT "fk_referir_expediente" FOREIGN KEY ("fkexpediente") REFERENCES "expediente"("idexpediente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallereferirpaciente" ADD CONSTRAINT "fk_referir_paciente" FOREIGN KEY ("fkpaciente") REFERENCES "paciente"("idpaciente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallereferirpaciente" ADD CONSTRAINT "fk_referir_usuario" FOREIGN KEY ("fkusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "detallereferirpaciente" ADD CONSTRAINT "fk_referir_usuariodestino" FOREIGN KEY ("fkusuariodestino") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "expediente" ADD CONSTRAINT "fk_expediente_paciente" FOREIGN KEY ("fkpaciente") REFERENCES "paciente"("idpaciente") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventariomedico" ADD CONSTRAINT "fk_inventario_usuario" FOREIGN KEY ("fkusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "paciente" ADD CONSTRAINT "fk_paciente_clinica" FOREIGN KEY ("fkclinica") REFERENCES "clinica"("idclinica") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "salidasinventario" ADD CONSTRAINT "fk_salida_medicina" FOREIGN KEY ("fkmedicina") REFERENCES "inventariomedico"("idmedicina") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "salidasinventario" ADD CONSTRAINT "fk_salida_usuario" FOREIGN KEY ("fkusuario") REFERENCES "usuario"("idusuario") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "fk_usuario_clinica" FOREIGN KEY ("fkclinica") REFERENCES "clinica"("idclinica") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "fk_usuario_rol" FOREIGN KEY ("fkrol") REFERENCES "rol"("idrol") ON DELETE NO ACTION ON UPDATE NO ACTION;
