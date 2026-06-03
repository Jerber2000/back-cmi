const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialMedicoController');
const { validarToken, verificarUsuarioEnBD } = require('../middlewares/auth');
const { fileService } = require('../services/fileService');
const {
    validarCrearSesion, validarActualizarSesion, validarPacienteId,
    validarHistorialId, validarSubirArchivos
} = require('../middlewares/validacionHistorialMedico');
const { verificarPermiso } = require('../middlewares/checkPermiso');

const uploadHistorial = fileService.createGenericMiddleware(['image', 'document'], 5);

router.use(validarToken);
router.use(verificarUsuarioEnBD);

const perm = verificarPermiso('historial');

router.get('/paciente/:idpaciente',         validarPacienteId, perm, historialController.obtenerHistorialPorPaciente);
router.get('/info-paciente/:idpaciente',    validarPacienteId, perm, historialController.obtenerInfoPaciente);
router.post('/crear-sesion',                validarCrearSesion, perm, historialController.crearSesion);
router.put('/actualizar-sesion/:idhistorial', validarActualizarSesion, perm, historialController.actualizarSesion);
router.post('/subir-archivos/:idpaciente',  validarSubirArchivos, uploadHistorial.array('archivos', 5), perm, historialController.subirArchivos);
router.put('/sesion/:idhistorial/archivos', validarHistorialId, perm, historialController.actualizarSesionConArchivos);
router.delete('/eliminar-sesion/:idhistorial', validarHistorialId, perm, historialController.eliminarSesion);
router.get('/sesion/:idhistorial/archivos', validarHistorialId, perm, historialController.obtenerArchivosSesion);

module.exports = router;
