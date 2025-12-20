// src/config/prisma.js
const { PrismaClient } = require('../generated/prisma');
const { crearAuditoriaMiddleware } = require('../middlewares/auditoria.middleware');

// Singleton pattern: garantiza una sola instancia
const prisma = global.prisma || new PrismaClient({
  // log: process.env.NODE_ENV === 'development' 
  //   ? ['query', 'error', 'warn'] 
  //   : ['error'],
});

// En desarrollo, reutilizar la instancia
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

prisma.$use(crearAuditoriaMiddleware());

// Manejo de cierre graceful
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