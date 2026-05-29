const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const getAllProgramas = async () => {
  return prisma.programa.findMany({ orderBy: { idprograma: 'asc' } });
};

const createPrograma = async ({ nombre }) => {
  return prisma.programa.create({
    data: { nombre: nombre.trim() }
  });
};

const updatePrograma = async (id, { nombre }) => {
  return prisma.programa.update({
    where: { idprograma: parseInt(id) },
    data: { nombre: nombre.trim() }
  });
};

const deletePrograma = async (id) => {
  // Eliminar primero las relaciones expediente_programa para no violar FK
  await prisma.expediente_programa.deleteMany({
    where: { idprograma: parseInt(id) }
  });
  return prisma.programa.delete({
    where: { idprograma: parseInt(id) }
  });
};

module.exports = {
  getAllProgramas,
  createPrograma,
  updatePrograma,
  deletePrograma
};
