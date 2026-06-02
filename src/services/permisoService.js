const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Roles que siempre tienen acceso total — no necesitan registro en rol_permiso
const ROLES_SUPERADMIN = [1, 4];

/**
 * Obtiene todas las páginas (permisos) del sistema
 */
const obtenerTodosLosPermisos = async () => {
  return prisma.permiso.findMany({ orderBy: { orden: 'asc' } });
};

/**
 * Obtiene los ids de permisos asignados a un rol específico
 */
const obtenerPermisosPorRol = async (idrol) => {
  const registros = await prisma.rol_permiso.findMany({
    where: { fkrol: parseInt(idrol) },
    select: { fkpermiso: true }
  });
  return registros.map(r => r.fkpermiso);
};

/**
 * Obtiene las RUTAS permitidas para el usuario actual según su rol.
 * Los superadmins reciben ['*'] (todo el acceso).
 */
const obtenerRutasPorRol = async (idrol) => {
  if (ROLES_SUPERADMIN.includes(parseInt(idrol))) {
    return ['*'];
  }

  const registros = await prisma.rol_permiso.findMany({
    where: { fkrol: parseInt(idrol) },
    include: { permiso: { select: { ruta: true } } }
  });

  return registros.map(r => r.permiso.ruta);
};

/**
 * Reemplaza los permisos de un rol con la nueva lista de permisosIds.
 * Usa transacción para garantizar consistencia.
 */
const actualizarPermisosPorRol = async (idrol, permisosIds) => {
  const fkrol = parseInt(idrol);

  // No permitir modificar roles superadmin
  if (ROLES_SUPERADMIN.includes(fkrol)) {
    throw new Error('No se pueden modificar los permisos de los roles de administración.');
  }

  const datos = permisosIds.map(id => ({ fkrol, fkpermiso: parseInt(id) }));

  return prisma.$transaction([
    prisma.rol_permiso.deleteMany({ where: { fkrol } }),
    ...(datos.length > 0 ? [prisma.rol_permiso.createMany({ data: datos })] : [])
  ]);
};

/**
 * Obtiene un resumen completo: todos los roles (menos superadmins) con sus permisos actuales.
 */
const obtenerResumenPermisos = async () => {
  const [permisos, roles] = await Promise.all([
    prisma.permiso.findMany({ orderBy: { orden: 'asc' } }),
    prisma.rol.findMany({
      where: {
        estado: 1,
        idrol: { notIn: ROLES_SUPERADMIN }
      },
      include: {
        permisos: { select: { fkpermiso: true } }
      },
      orderBy: { idrol: 'asc' }
    })
  ]);

  return {
    permisos,
    roles: roles.map(r => ({
      idrol: r.idrol,
      nombre: r.nombre,
      descripcion: r.descripcion,
      permisosAsignados: r.permisos.map(p => p.fkpermiso)
    }))
  };
};

module.exports = {
  ROLES_SUPERADMIN,
  obtenerTodosLosPermisos,
  obtenerPermisosPorRol,
  obtenerRutasPorRol,
  actualizarPermisosPorRol,
  obtenerResumenPermisos
};
