-- CreateTable
CREATE TABLE "expediente_programa" (
    "idexpediente" INTEGER NOT NULL,
    "idprograma" INTEGER NOT NULL,

    CONSTRAINT "expediente_programa_pkey" PRIMARY KEY ("idexpediente","idprograma")
);

-- AddForeignKey
ALTER TABLE "expediente_programa" ADD CONSTRAINT "expediente_programa_idexpediente_fkey" FOREIGN KEY ("idexpediente") REFERENCES "expediente"("idexpediente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expediente_programa" ADD CONSTRAINT "expediente_programa_idprograma_fkey" FOREIGN KEY ("idprograma") REFERENCES "programa"("idprograma") ON DELETE CASCADE ON UPDATE CASCADE;
