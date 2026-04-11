const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function main() {
  await prisma.programa.deleteMany({});
  await prisma.programa.createMany({
    data: [
      { nombre: 'PROGRAMA 1' },
      { nombre: 'PROGRAMA 2' },
      { nombre: 'PROGRAMA 3' },
    ],
  });
  console.log('Programas insertados correctamente.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
