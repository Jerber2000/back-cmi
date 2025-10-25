// src/routes/inventariomedicoRoutes.js
const { Router } = require('express');
const inventarioMedicoController = require('../controllers/inventarioMedicoController');
const inventarioMiddleware = require('../middlewares/validationInventario');
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');

// ← IMPORTAR el controller y middleware de salidas
const salidasInventarioController = require('../controllers/salidasInventarioController');
const salidasMiddleware = require('../middlewares/validacionSalidas');

const router = Router();

// GET - Listar todos
router.get(
  '/',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
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
  inventarioMedicoController.obtenerPorId
);

// POST - Crear nuevo
router.post(
  '/',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  inventarioMiddleware.validarCrear,
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
  inventarioMedicoController.actualizar
);

module.exports = router;
