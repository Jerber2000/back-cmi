// src/routes/referirRoutes.js
const express = require('express');
const router = express.Router();

const referirController = require('../controllers/referirController');
const { validarToken, verificarUsuarioEnBD } = require('../middlewares/auth');
const validarReferido = require('../middlewares/validarReferido');
const checkRole = require('../middlewares/checkRole');

// ============================================================================
// MIDDLEWARE DE AUTENTICACIÓN GLOBAL
// ============================================================================
router.use(validarToken);
router.use(verificarUsuarioEnBD);

// ============================================================================
// RUTAS CRUD
// ============================================================================

// Obtener clínicas activas
router.get('/clinicas',
  checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
  referirController.obtenerClinicas
);

// POST /referir - Crear nuevo referido
router.post('/',
  validarReferido.validarCreacion,
  checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
  referirController.crearReferido
);

// GET /referir - Listar referidos con filtros
router.get('/',
  checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
  referirController.obtenerReferidos
);

// GET /referir/paciente/:idPaciente - Historial de referidos de un paciente
router.get('/paciente/:idPaciente',
  checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
  referirController.obtenerHistorialPaciente
);

// GET /referir/:id - Obtener detalle de un referido
router.get('/:id',
  validarReferido.validarExistencia,
  validarReferido.validarPermisoVer,
  checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
  referirController.obtenerReferidoPorId
);

// PUT /referir/:id/confirmar - Confirmar/aprobar referido
router.put('/:id/confirmar',
  validarReferido.validarExistencia,
  validarReferido.validarPermisoConfirmar,
  checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
  referirController.confirmarReferido
);

// PUT /referir/:id - Actualizar datos del referido
router.put('/:id',
  validarReferido.validarExistencia,
  validarReferido.validarPermisoActualizar,
  validarReferido.validarDatosActualizacion,
  checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
  referirController.actualizarReferido
);

// PUT /referir/:id/estado - Cambiar estado (eliminado lógico)
router.put('/:id/estado',
  validarReferido.validarExistencia,
  checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
  referirController.cambiarEstado
);

module.exports = router;