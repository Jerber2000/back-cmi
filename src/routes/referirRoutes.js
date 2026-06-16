const express = require('express');
const router = express.Router();
const referirController = require('../controllers/referirController');
const { validarToken, verificarUsuarioEnBD } = require('../middlewares/auth');
const validarReferido = require('../middlewares/validarReferido');
const { verificarPermiso } = require('../middlewares/checkPermiso');

router.use(validarToken);
router.use(verificarUsuarioEnBD);

const perm = verificarPermiso('referidos');

// Clínicas — utilidad para dropdowns
router.get('/clinicas', referirController.obtenerClinicas);

router.post('/',             validarReferido.validarCreacion, perm, referirController.crearReferido);
router.get('/',              perm, referirController.obtenerReferidos);
router.get('/paciente/:idPaciente', perm, referirController.obtenerHistorialPaciente);
router.get('/:id',           validarReferido.validarExistencia, validarReferido.validarPermisoVer, perm, referirController.obtenerReferidoPorId);
router.put('/:id/confirmar', validarReferido.validarExistencia, validarReferido.validarPermisoConfirmar, perm, referirController.confirmarReferido);
router.put('/:id',           validarReferido.validarExistencia, validarReferido.validarPermisoActualizar, validarReferido.validarDatosActualizacion, perm, referirController.actualizarReferido);
router.put('/:id/estado',    validarReferido.validarExistencia, perm, referirController.cambiarEstado);

module.exports = router;
