// seed_local.js — ejecutar UNA SOLA VEZ: node seed_local.js
const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

const PERMISOS = [
  { nombre: 'Gestión de Usuarios',   descripcion: 'Administración de usuarios',          ruta: 'usuario',            icono: 'fa-users',          orden: 1 },
  { nombre: 'Pacientes',             descripcion: 'Registro y gestión de pacientes',      ruta: 'pacientes',          icono: 'fa-user-injured',   orden: 2 },
  { nombre: 'Expedientes',           descripcion: 'Expedientes médicos',                  ruta: 'expedientes',        icono: 'fa-folder-open',    orden: 3 },
  { nombre: 'Historial Clínico',     descripcion: 'Historial de sesiones clínicas',       ruta: 'historial',          icono: 'fa-file-medical',   orden: 4 },
  { nombre: 'Agenda',                descripcion: 'Gestión de citas y agenda',            ruta: 'agenda',             icono: 'fa-calendar-alt',   orden: 5 },
  { nombre: 'Referidos',             descripcion: 'Gestión de referidos',                 ruta: 'referidos',          icono: 'fa-exchange-alt',   orden: 6 },
  { nombre: 'Reportería',            descripcion: 'Reportes y estadísticas',              ruta: 'reporteria',         icono: 'fa-chart-bar',      orden: 7 },
  { nombre: 'Documentos',            descripcion: 'Documentos institucionales',           ruta: 'documentos',         icono: 'fa-file-alt',       orden: 8 },
  { nombre: 'Inventario',            descripcion: 'Inventario de medicamentos',           ruta: 'inventario',         icono: 'fa-pills',          orden: 9 },
  { nombre: 'Salidas de Inventario', descripcion: 'Registro de salidas',                 ruta: 'salida-inventario',  icono: 'fa-box-open',       orden: 10 },
  { nombre: 'Administración',        descripcion: 'Panel de administración',              ruta: 'administracion',     icono: 'fa-cog',            orden: 11 },
  { nombre: 'Educación Inclusiva',   descripcion: 'Módulo de educación inclusiva',        ruta: 'educacion-inclusiva',icono: 'fa-graduation-cap', orden: 12 },
  { nombre: 'Fisioterapia',          descripcion: 'Módulo de fisioterapia',               ruta: 'fisioterapia',       icono: 'fa-walking',        orden: 13 },
  { nombre: 'Medicina General',      descripcion: 'Módulo de medicina general',           ruta: 'medicina-general',   icono: 'fa-stethoscope',    orden: 14 },
  { nombre: 'Nutrición',             descripcion: 'Módulo de nutrición',                  ruta: 'nutricion',          icono: 'fa-apple-alt',      orden: 15 },
  { nombre: 'Psicología',            descripcion: 'Módulo de psicología',                 ruta: 'psicologia',         icono: 'fa-brain',          orden: 16 },
];

// Permisos por rol (excluye roles 1 y 4 que tienen acceso total)
const ROL_RUTAS = {
  2:  ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','medicina-general'],
  3:  ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','medicina-general'],
  5:  ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','administracion','fisioterapia','medicina-general','educacion-inclusiva','nutricion','psicologia'],
  6:  ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','fisioterapia','medicina-general'],
  7:  ['usuario','pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','inventario','salida-inventario'],
  8:  ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','administracion'],
  9:  ['reporteria','inventario','salida-inventario'],
  10: ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','psicologia'],
  11: ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','psicologia'],
  12: ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos'],
  13: ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','nutricion'],
  14: ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','fisioterapia','medicina-general','nutricion'],
  15: ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','educacion-inclusiva'],
  16: ['pacientes','expedientes','historial','agenda','referidos','reporteria','documentos','educacion-inclusiva'],
};

async function main() {
  console.log('Insertando permisos...');
  for (const p of PERMISOS) {
    await prisma.permiso.upsert({
      where: { ruta: p.ruta },
      update: {},
      create: p,
    });
  }
  console.log(`✓ ${PERMISOS.length} permisos insertados`);

  // Obtener todos los permisos con sus ids
  const permisos = await prisma.permiso.findMany();
  const rutaAId = Object.fromEntries(permisos.map(p => [p.ruta, p.idpermiso]));

  console.log('Insertando rol_permiso...');
  let total = 0;
  for (const [fkrol, rutas] of Object.entries(ROL_RUTAS)) {
    for (const ruta of rutas) {
      const fkpermiso = rutaAId[ruta];
      if (!fkpermiso) { console.warn(`Ruta no encontrada: ${ruta}`); continue; }
      await prisma.rol_permiso.upsert({
        where: { fkrol_fkpermiso: { fkrol: parseInt(fkrol), fkpermiso } },
        update: {},
        create: { fkrol: parseInt(fkrol), fkpermiso },
      });
      total++;
    }
  }
  console.log(`✓ ${total} asignaciones rol_permiso insertadas`);
  console.log('Seed completado.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
