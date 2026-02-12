
const express = require('express');
const router = express.Router();

const referirController = require('../controllers/referirController');
const { validarToken, verificarUsuarioEnBD } = require('../middlewares/auth');
const validarReferido = require('../middlewares/validarReferido');
const checkRole = require('../middlewares/checkRole');

router.use(validarToken);
router.use(verificarUsuarioEnBD);

router.get('/clinicas',
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  referirController.obtenerClinicas
);

router.post('/',
  validarReferido.validarCreacion,
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  referirController.crearReferido
);

router.get('/',
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  referirController.obtenerReferidos
);

router.get('/paciente/:idPaciente',
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  referirController.obtenerHistorialPaciente
);

router.get('/:id',
  validarReferido.validarExistencia,
  validarReferido.validarPermisoVer,
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  referirController.obtenerReferidoPorId
);

router.put('/:id/confirmar',
  validarReferido.validarExistencia,
  validarReferido.validarPermisoConfirmar,
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  referirController.confirmarReferido
);

router.put('/:id',
  validarReferido.validarExistencia,
  validarReferido.validarPermisoActualizar,
  validarReferido.validarDatosActualizacion,
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  referirController.actualizarReferido
);

router.put('/:id/estado',
  validarReferido.validarExistencia,
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  referirController.cambiarEstado
);

module.exports = router;