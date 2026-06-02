const express = require('express');
const router = express.Router();
const permisoController = require('../controllers/permisoController');
const autenticacion = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const validarCambioClave = require('../middlewares/validarCambioClave');

// Ruta que llama el roleGuard en el frontend para saber qué páginas puede ver el usuario
router.get('/mis-rutas',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  permisoController.obtenerMisRutas
);

// Rutas de administración — solo Administrador (1) y Sistemas (4)
router.get('/',
  autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave, checkRole(1, 4),
  permisoController.obtenerTodos
);

router.get('/resumen',
  autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave, checkRole(1, 4),
  permisoController.obtenerResumen
);

router.get('/rol/:idrol',
  autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave, checkRole(1, 4),
  permisoController.obtenerPorRol
);

router.put('/rol/:idrol',
  autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave, checkRole(1, 4),
  permisoController.actualizarPorRol
);

module.exports = router;
