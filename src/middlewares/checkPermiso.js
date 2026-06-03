/**
 * checkPermiso.js
 * Middleware dinámico: verifica si el rol del usuario tiene acceso
 * a una página específica según la tabla rol_permiso en BD.
 *
 * Roles 1 (Admin) y 4 (Sistemas) siempre tienen acceso total.
 * Cache en memoria con TTL de 5 minutos para no golpear la BD en cada request.
 */

const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const ROLES_SUPERADMIN = [1, 4];
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Map<"fkrol:rutaPagina", { tieneAcceso: bool, expires: number }>
const _cache = new Map();

/**
 * Middleware factory.
 * @param {string} rutaPagina - Ruta de la página en la tabla permiso (ej: 'inventario')
 */
const verificarPermiso = (rutaPagina) => {
  return async (req, res, next) => {
    try {
      const fkrol = req.usuario?.fkrol;

      if (!fkrol) {
        return res.status(401).json({ success: false, message: 'No autenticado' });
      }

      // Superadmin: acceso total sin consultar BD
      if (ROLES_SUPERADMIN.includes(fkrol)) {
        return next();
      }

      // Revisar caché
      const cacheKey = `${fkrol}:${rutaPagina}`;
      const cached = _cache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        if (cached.tieneAcceso) return next();
        return res.status(403).json({
          success: false,
          message: 'No tienes permisos para realizar esta acción',
          detalles: { pagina: rutaPagina }
        });
      }

      // Consultar BD: ¿tiene este rol permiso para esta página?
      const registro = await prisma.rol_permiso.findFirst({
        where: {
          fkrol,
          permiso: { ruta: rutaPagina }
        }
      });

      const tieneAcceso = !!registro;

      // Guardar en caché
      _cache.set(cacheKey, { tieneAcceso, expires: Date.now() + CACHE_TTL });

      if (tieneAcceso) return next();

      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        detalles: { pagina: rutaPagina }
      });

    } catch (error) {
      // Si falla la BD (tablas no creadas, conexión, etc.) → permitir acceso
      // para no romper el sistema mientras se migra
      console.error(`[checkPermiso] Error verificando permiso '${rutaPagina}':`, error.message);
      return next();
    }
  };
};

/** Limpia toda la caché (usar cuando se actualicen permisos en la UI) */
const limpiarCachePermisos = () => {
  _cache.clear();
};

/** Limpia caché de un rol específico */
const limpiarCacheRol = (fkrol) => {
  for (const key of _cache.keys()) {
    if (key.startsWith(`${fkrol}:`)) _cache.delete(key);
  }
};

module.exports = { verificarPermiso, limpiarCachePermisos, limpiarCacheRol };
