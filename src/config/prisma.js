
const { PrismaClient } = require('../generated/prisma');
const { crearAuditoriaMiddleware } = require('../middlewares/auditoria.middleware');

const prisma = global.prisma || new PrismaClient({
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

prisma.$use(crearAuditoriaMiddleware());

process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { prisma };