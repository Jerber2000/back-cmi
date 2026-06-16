const permisoService = require('../services/permisoService');
const { limpiarCacheRol } = require('../middlewares/checkPermiso');

/**
 * GET /api/permisos
 * Devuelve todas las páginas del sistema (solo admin).
 */
exports.obtenerTodos = async (req, res) => {
  try {
    const data = await permisoService.obtenerTodosLosPermisos();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener permisos', error: error.message });
  }
};

/**
 * GET /api/permisos/mis-rutas
 * Devuelve las rutas a las que tiene acceso el usuario autenticado.
 */
exports.obtenerMisRutas = async (req, res) => {
  try {
    const idrol = req.usuario.fkrol;
    const rutas = await permisoService.obtenerRutasPorRol(idrol);
    res.json({ success: true, data: rutas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener permisos del usuario', error: error.message });
  }
};

/**
 * GET /api/permisos/resumen
 * Devuelve todos los roles con sus permisos actuales (para el panel admin).
 */
exports.obtenerResumen = async (req, res) => {
  try {
    const data = await permisoService.obtenerResumenPermisos();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener resumen de permisos', error: error.message });
  }
};

/**
 * GET /api/permisos/rol/:idrol
 * Devuelve los ids de permisos asignados a un rol.
 */
exports.obtenerPorRol = async (req, res) => {
  try {
    const { idrol } = req.params;
    const data = await permisoService.obtenerPermisosPorRol(idrol);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener permisos del rol', error: error.message });
  }
};

/**
 * PUT /api/permisos/rol/:idrol
 * Reemplaza los permisos de un rol.
 * Body: { permisosIds: number[] }
 */
exports.actualizarPorRol = async (req, res) => {
  try {
    const { idrol } = req.params;
    const { permisosIds } = req.body;

    if (!Array.isArray(permisosIds)) {
      return res.status(400).json({ success: false, message: 'permisosIds debe ser un array' });
    }

    await permisoService.actualizarPermisosPorRol(idrol, permisosIds);
    // Limpiar caché del servidor para este rol
    limpiarCacheRol(parseInt(idrol));
    res.json({ success: true, message: 'Permisos actualizados correctamente' });
  } catch (error) {
    if (error.message.includes('No se pueden modificar')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error al actualizar permisos', error: error.message });
  }
};
