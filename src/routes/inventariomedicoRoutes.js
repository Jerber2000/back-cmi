// src/routes/inventariomedicoRoutes.js
const { Router } = require('express');
const inventarioMedicoController = require('../controllers/inventarioMedicoController');
const inventarioMiddleware = require('../middlewares/validationInventario');
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const checkRole = require('../middlewares/checkRole');

const router = Router();

// GET - Listar todos
router.get(
  '/',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  checkRole(1,5,10),
  inventarioMedicoController.listarTodos
);

// ===== RUTAS ESPECÍFICAS PRIMERO =====


// PUT - Cambiar estado (activo/inactivo)
// ⚠️ También debe ir antes de /:id
router.put(
  '/:id/estado',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  inventarioMiddleware.validarId,
  inventarioMiddleware.validarCambiarEstado,
  checkRole(1,5,10),
  inventarioMedicoController.cambiarEstado
);

// ===== RUTAS GENÉRICAS AL FINAL =====

// GET - Obtener por ID
router.get(
  '/:id',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  inventarioMiddleware.validarId,
  checkRole(1,5,10),
  inventarioMedicoController.obtenerPorId
);

// POST - Crear nuevo
router.post(
  '/',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  inventarioMiddleware.validarCrear,
  checkRole(1,5,10),
  inventarioMedicoController.crear
);

// PUT - Actualizar
router.put(
  '/:id',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  inventarioMiddleware.validarId,
  inventarioMiddleware.validarActualizar,
  checkRole(1,5,10),
  inventarioMedicoController.actualizar
);

module.exports = router;
