// fix_catalogo_real.js — reemplaza el catálogo de permisos/rol_permiso
// (creado incorrectamente por seed_local.js) por el catálogo REAL copiado
// directo de la base de datos de referencia. Ejecutar UNA SOLA VEZ.
const permisos = [
  { "idpermiso": 1, "nombre": "Gestión de Usuarios", "descripcion": "Administración de usuarios", "ruta": "usuario", "icono": "fa-users", "orden": 1 },
  { "idpermiso": 2, "nombre": "Pacientes", "descripcion": "Registro y gestión de pacientes", "ruta": "pacientes", "icono": "fa-user-injured", "orden": 2 },
  { "idpermiso": 3, "nombre": "Expedientes", "descripcion": "Expedientes médicos", "ruta": "expedientes", "icono": "fa-folder-open", "orden": 3 },
  { "idpermiso": 4, "nombre": "Historial Clínico", "descripcion": "Historial de sesiones clínicas", "ruta": "historial", "icono": "fa-file-medical", "orden": 4 },
  { "idpermiso": 5, "nombre": "Agenda", "descripcion": "Gestión de citas y agenda", "ruta": "agenda", "icono": "fa-calendar-alt", "orden": 5 },
  { "idpermiso": 6, "nombre": "Referidos", "descripcion": "Gestión de referidos", "ruta": "referidos", "icono": "fa-exchange-alt", "orden": 6 },
  { "idpermiso": 7, "nombre": "Reportería", "descripcion": "Reportes y estadísticas", "ruta": "reporteria", "icono": "fa-chart-bar", "orden": 7 },
  { "idpermiso": 17, "nombre": "Reportería: Pacientes", "descripcion": "Pestaña de reporte de pacientes", "ruta": "reporteria-pacientes", "icono": "fa-user-injured", "orden": 8 },
  { "idpermiso": 18, "nombre": "Reportería: Historial Clínico", "descripcion": "Pestaña de reporte de historial clínico", "ruta": "reporteria-historial", "icono": "fa-file-medical", "orden": 9 },
  { "idpermiso": 19, "nombre": "Reportería: Inventario", "descripcion": "Pestaña de reporte de inventario", "ruta": "reporteria-inventario", "icono": "fa-pills", "orden": 10 },
  { "idpermiso": 20, "nombre": "Reportería: Agenda", "descripcion": "Pestaña de reporte de agenda", "ruta": "reporteria-agenda", "icono": "fa-calendar-alt", "orden": 11 },
  { "idpermiso": 21, "nombre": "Reportería: Referencias", "descripcion": "Pestaña de reporte de referencias", "ruta": "reporteria-referencias", "icono": "fa-exchange-alt", "orden": 12 },
  { "idpermiso": 8, "nombre": "Documentos", "descripcion": "Documentos institucionales", "ruta": "documentos", "icono": "fa-file-alt", "orden": 13 },
  { "idpermiso": 9, "nombre": "Inventario", "descripcion": "Inventario de medicamentos", "ruta": "inventario", "icono": "fa-pills", "orden": 14 },
  { "idpermiso": 10, "nombre": "Salidas de Inventario", "descripcion": "Registro de salidas", "ruta": "salida-inventario", "icono": "fa-box-open", "orden": 15 },
  { "idpermiso": 22, "nombre": "Expedientes: Programas", "descripcion": "Boton de gestion de programas dentro de Expedientes", "ruta": "expedientes-programas", "icono": "fa-clipboard-list", "orden": 16 },
  { "idpermiso": 23, "nombre": "Historial: Examen Mental", "descripcion": "Boton de examen mental (psicologia) dentro de Historial Clinico", "ruta": "historial-examen-mental", "icono": "fa-brain", "orden": 17 },
  { "idpermiso": 24, "nombre": "Agenda: Transporte", "descripcion": "Boton de reporte de transportes dentro de Agenda", "ruta": "agenda-transporte", "icono": "fa-bus", "orden": 18 },
  { "idpermiso": 25, "nombre": "Agenda: Ver Historial Clinico", "descripcion": "Boton para ver historial clinico desde el modal de una cita", "ruta": "agenda-historial-clinico", "icono": "fa-file-medical-alt", "orden": 19 }
];

const rolPermiso = [
  {"fkrol":5,"fkpermiso":2},{"fkrol":5,"fkpermiso":3},{"fkrol":5,"fkpermiso":4},{"fkrol":5,"fkpermiso":5},{"fkrol":5,"fkpermiso":6},{"fkrol":5,"fkpermiso":7},{"fkrol":5,"fkpermiso":8},
  {"fkrol":6,"fkpermiso":2},{"fkrol":6,"fkpermiso":3},{"fkrol":6,"fkpermiso":4},{"fkrol":6,"fkpermiso":5},{"fkrol":6,"fkpermiso":6},{"fkrol":6,"fkpermiso":7},{"fkrol":6,"fkpermiso":8},
  {"fkrol":7,"fkpermiso":1},{"fkrol":7,"fkpermiso":2},{"fkrol":7,"fkpermiso":3},{"fkrol":7,"fkpermiso":4},{"fkrol":7,"fkpermiso":5},{"fkrol":7,"fkpermiso":6},{"fkrol":7,"fkpermiso":7},{"fkrol":7,"fkpermiso":8},{"fkrol":7,"fkpermiso":9},{"fkrol":7,"fkpermiso":10},
  {"fkrol":8,"fkpermiso":2},{"fkrol":8,"fkpermiso":3},{"fkrol":8,"fkpermiso":4},{"fkrol":8,"fkpermiso":5},{"fkrol":8,"fkpermiso":6},{"fkrol":8,"fkpermiso":7},{"fkrol":8,"fkpermiso":8},
  {"fkrol":10,"fkpermiso":2},{"fkrol":10,"fkpermiso":3},{"fkrol":10,"fkpermiso":4},{"fkrol":10,"fkpermiso":5},{"fkrol":10,"fkpermiso":6},{"fkrol":10,"fkpermiso":7},{"fkrol":10,"fkpermiso":8},
  {"fkrol":11,"fkpermiso":2},{"fkrol":11,"fkpermiso":3},{"fkrol":11,"fkpermiso":4},{"fkrol":11,"fkpermiso":5},{"fkrol":11,"fkpermiso":6},{"fkrol":11,"fkpermiso":7},{"fkrol":11,"fkpermiso":8},
  {"fkrol":12,"fkpermiso":2},{"fkrol":12,"fkpermiso":3},{"fkrol":12,"fkpermiso":4},{"fkrol":12,"fkpermiso":5},{"fkrol":12,"fkpermiso":6},{"fkrol":12,"fkpermiso":7},{"fkrol":12,"fkpermiso":8},
  {"fkrol":13,"fkpermiso":2},{"fkrol":13,"fkpermiso":3},{"fkrol":13,"fkpermiso":4},{"fkrol":13,"fkpermiso":5},{"fkrol":13,"fkpermiso":6},{"fkrol":13,"fkpermiso":7},{"fkrol":13,"fkpermiso":8},
  {"fkrol":14,"fkpermiso":2},{"fkrol":14,"fkpermiso":3},{"fkrol":14,"fkpermiso":4},{"fkrol":14,"fkpermiso":5},{"fkrol":14,"fkpermiso":6},{"fkrol":14,"fkpermiso":7},{"fkrol":14,"fkpermiso":8},
  {"fkrol":15,"fkpermiso":2},{"fkrol":15,"fkpermiso":3},{"fkrol":15,"fkpermiso":4},{"fkrol":15,"fkpermiso":5},{"fkrol":15,"fkpermiso":6},{"fkrol":15,"fkpermiso":7},{"fkrol":15,"fkpermiso":8},
  {"fkrol":16,"fkpermiso":2},{"fkrol":16,"fkpermiso":3},{"fkrol":16,"fkpermiso":4},{"fkrol":16,"fkpermiso":5},{"fkrol":16,"fkpermiso":6},{"fkrol":16,"fkpermiso":7},{"fkrol":16,"fkpermiso":8},
  {"fkrol":5,"fkpermiso":17},{"fkrol":6,"fkpermiso":17},{"fkrol":7,"fkpermiso":17},{"fkrol":8,"fkpermiso":17},{"fkrol":10,"fkpermiso":17},{"fkrol":11,"fkpermiso":17},{"fkrol":12,"fkpermiso":17},{"fkrol":13,"fkpermiso":17},{"fkrol":14,"fkpermiso":17},{"fkrol":15,"fkpermiso":17},{"fkrol":16,"fkpermiso":17},
  {"fkrol":5,"fkpermiso":18},{"fkrol":6,"fkpermiso":18},{"fkrol":7,"fkpermiso":18},{"fkrol":8,"fkpermiso":18},{"fkrol":10,"fkpermiso":18},{"fkrol":11,"fkpermiso":18},{"fkrol":12,"fkpermiso":18},{"fkrol":13,"fkpermiso":18},{"fkrol":14,"fkpermiso":18},{"fkrol":15,"fkpermiso":18},{"fkrol":16,"fkpermiso":18},
  {"fkrol":5,"fkpermiso":20},{"fkrol":6,"fkpermiso":20},{"fkrol":7,"fkpermiso":20},{"fkrol":8,"fkpermiso":20},{"fkrol":10,"fkpermiso":20},{"fkrol":11,"fkpermiso":20},{"fkrol":12,"fkpermiso":20},{"fkrol":13,"fkpermiso":20},{"fkrol":14,"fkpermiso":20},{"fkrol":15,"fkpermiso":20},{"fkrol":16,"fkpermiso":20},
  {"fkrol":5,"fkpermiso":21},{"fkrol":6,"fkpermiso":21},{"fkrol":7,"fkpermiso":21},{"fkrol":8,"fkpermiso":21},{"fkrol":10,"fkpermiso":21},{"fkrol":11,"fkpermiso":21},{"fkrol":12,"fkpermiso":21},{"fkrol":13,"fkpermiso":21},{"fkrol":14,"fkpermiso":21},{"fkrol":15,"fkpermiso":21},{"fkrol":16,"fkpermiso":21},
  {"fkrol":7,"fkpermiso":19},
  {"fkrol":9,"fkpermiso":7},{"fkrol":9,"fkpermiso":9},{"fkrol":9,"fkpermiso":10},{"fkrol":9,"fkpermiso":19},
  {"fkrol":2,"fkpermiso":4},{"fkrol":2,"fkpermiso":2},
  {"fkrol":3,"fkpermiso":4},{"fkrol":3,"fkpermiso":2},
  {"fkrol":1,"fkpermiso":22},{"fkrol":4,"fkpermiso":22},{"fkrol":7,"fkpermiso":22},
  {"fkrol":1,"fkpermiso":23},{"fkrol":4,"fkpermiso":23},{"fkrol":10,"fkpermiso":23},{"fkrol":7,"fkpermiso":23},
  {"fkrol":1,"fkpermiso":24},{"fkrol":4,"fkpermiso":24},{"fkrol":7,"fkpermiso":24},
  {"fkrol":1,"fkpermiso":25},{"fkrol":2,"fkpermiso":25},{"fkrol":3,"fkpermiso":25},{"fkrol":4,"fkpermiso":25},{"fkrol":5,"fkpermiso":25},{"fkrol":6,"fkpermiso":25},{"fkrol":7,"fkpermiso":25},{"fkrol":8,"fkpermiso":25},{"fkrol":10,"fkpermiso":25},{"fkrol":11,"fkpermiso":25},{"fkrol":12,"fkpermiso":25},{"fkrol":13,"fkpermiso":25},{"fkrol":14,"fkpermiso":25},{"fkrol":15,"fkpermiso":25},{"fkrol":16,"fkpermiso":25}
];

(async () => {
  const { PrismaClient } = require('./src/generated/prisma');
  const prisma = new PrismaClient();

  console.log('Borrando permisos/rol_permiso creados incorrectamente...');
  await prisma.rol_permiso.deleteMany({});
  await prisma.permiso.deleteMany({});

  console.log('Insertando', permisos.length, 'permisos (catálogo real)...');
  for (const p of permisos) {
    await prisma.permiso.create({ data: p });
  }

  console.log('Insertando', rolPermiso.length, 'asignaciones rol_permiso...');
  for (const rp of rolPermiso) {
    await prisma.rol_permiso.create({ data: rp });
  }

  await prisma.$executeRawUnsafe(
    "SELECT setval('permiso_idpermiso_seq', (SELECT MAX(idpermiso) FROM permiso))"
  );

  console.log('Listo: catálogo real aplicado.');
  process.exit(0);
})();
