const express = require('express');
const router = express.Router();
const permisoController = require('../controllers/permisoController');
const autenticacion = require('../middlewares/auth');
const checkRole = require('../middlewares/checkRole');
const validarCambioClave = require('../middlewares/validarCambioClave');

const auth = [autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave];
const soloAdmin = [...auth, checkRole(1, 4)];

// Ruta que llama el roleGuard en el frontend para saber qué páginas puede ver el usuario
router.get('/mis-rutas', auth, permisoController.obtenerMisRutas);

// Rutas de administración — solo Administrador (1) y Sistemas (4)
router.get('/',                soloAdmin, permisoController.obtenerTodos);
router.get('/resumen',         soloAdmin, permisoController.obtenerResumen);
router.get('/rol/:idrol',      soloAdmin, permisoController.obtenerPorRol);
router.put('/rol/:idrol',      soloAdmin, permisoController.actualizarPorRol);

module.exports = router;
