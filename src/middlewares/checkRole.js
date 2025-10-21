// middlewares/checkRole.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

// Cache para mensajes de error legibles
let rolesCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtener roles desde cache (solo para mensajes de error)
 */
async function obtenerRolesParaMensajes() {
  const ahora = Date.now();
  
  if (!rolesCache || !cacheTimestamp || (ahora - cacheTimestamp) > CACHE_DURATION) {
    rolesCache = await prisma.rol.findMany({
      where: { estado: 1 },
      select: { idrol: true, nombre: true }
    });
    cacheTimestamp = ahora;
  }
  
  return rolesCache;
}

/**
 * Middleware para verificar si el usuario tiene uno de los roles permitidos (por ID)
 * @param {...number} idsRolesPermitidos - IDs de los roles que pueden acceder
 * @returns {Function} Middleware de Express
 */
const checkRole = (...idsRolesPermitidos) => {
  return async (req, res, next) => {
    try {
      // Obtener el rol del usuario desde req.usuario (viene de verificarUsuarioEnBD)
      const fkrol = req.usuario.fkrol;

      if (!fkrol) {
        return res.status(403).json({
          success: false,
          message: 'No se pudo determinar el rol del usuario'
        });
      }

      // ⭐ VALIDACIÓN DIRECTA - MUY RÁPIDA (sin consulta a BD)
      const tienePermiso = idsRolesPermitidos.includes(fkrol);

      if (!tienePermiso) {
        // Solo aquí consultamos BD para hacer el mensaje de error legible
        const roles = await obtenerRolesParaMensajes();
        const rolUsuario = roles.find(r => r.idrol === fkrol);
        const nombresPermitidos = idsRolesPermitidos.map(id => {
          const rol = roles.find(r => r.idrol === id);
          return rol ? rol.nombre : `ID: ${id}`;
        });

        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esa acción',
          detalles: {
            tuRol: rolUsuario ? rolUsuario.nombre : `ID: ${fkrol}`,
            rolesPermitidos: nombresPermitidos
          }
        });
      }

      // Permiso concedido
      next();
    } catch (error) {
      console.error('Error en checkRole:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al verificar permisos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

module.exports = checkRole;