const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const getAllProgramas = async () => {
  return prisma.programa.findMany({ orderBy: { idprograma: 'asc' } });
};

module.exports = {
  getAllProgramas
};
