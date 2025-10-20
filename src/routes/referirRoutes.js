// src/routes/referirRoutes.js
const express = require('express');
const router = express.Router();

const referirController = require('../controllers/referirController');
const { validarToken, verificarUsuarioEnBD } = require('../middlewares/auth');
const validarReferido = require('../middlewares/validarReferido');

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
  referirController.obtenerClinicas
);

// POST /referir - Crear nuevo referido
router.post('/',
  validarReferido.validarCreacion,
  referirController.crearReferido
);

// GET /referir - Listar referidos con filtros
router.get('/',
  referirController.obtenerReferidos
);

// GET /referir/paciente/:idPaciente - Historial de referidos de un paciente
router.get('/paciente/:idPaciente',
  referirController.obtenerHistorialPaciente
);

// GET /referir/:id - Obtener detalle de un referido
router.get('/:id',
  validarReferido.validarExistencia,
  validarReferido.validarPermisoVer,
  referirController.obtenerReferidoPorId
);

// PUT /referir/:id/confirmar - Confirmar/aprobar referido
router.put('/:id/confirmar',
  validarReferido.validarExistencia,
  validarReferido.validarPermisoConfirmar,
  referirController.confirmarReferido
);

// PUT /referir/:id - Actualizar datos del referido
router.put('/:id',
  validarReferido.validarExistencia,
  validarReferido.validarPermisoActualizar,
  validarReferido.validarDatosActualizacion,
  referirController.actualizarReferido
);

// PUT /referir/:id/estado - Cambiar estado (eliminado lógico)
router.put('/:id/estado',
  validarReferido.validarExistencia,
  referirController.cambiarEstado
);

module.exports = router;