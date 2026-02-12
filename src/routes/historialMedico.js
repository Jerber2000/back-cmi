
const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialMedicoController');
const { validarToken, verificarUsuarioEnBD } = require('../middlewares/auth');
const { fileService } = require('../services/fileService'); 
const {
    validarCrearSesion,
    validarActualizarSesion,
    validarPacienteId,
    validarHistorialId,
    validarSubirArchivos
} = require('../middlewares/validacionHistorialMedico');
const checkRole = require('../middlewares/checkRole');

const uploadHistorial = fileService.createGenericMiddleware(['image', 'document'], 5);

router.use(validarToken);
router.use(verificarUsuarioEnBD);

router.get('/paciente/:idpaciente', 
    validarPacienteId,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    historialController.obtenerHistorialPorPaciente
);

router.get('/info-paciente/:idpaciente', 
    validarPacienteId,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    historialController.obtenerInfoPaciente
);

router.post('/crear-sesion', 
    validarCrearSesion,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    historialController.crearSesion
);

router.put('/actualizar-sesion/:idhistorial', 
    validarActualizarSesion,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    historialController.actualizarSesion
);

router.post('/subir-archivos/:idpaciente',
    validarSubirArchivos,
    uploadHistorial.array('archivos', 5),
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    historialController.subirArchivos
);

router.put('/sesion/:idhistorial/archivos',
    validarHistorialId,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    historialController.actualizarSesionConArchivos
);

router.delete('/eliminar-sesion/:idhistorial',
    validarHistorialId,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    historialController.eliminarSesion
);

router.get('/sesion/:idhistorial/archivos',
    validarHistorialId,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    historialController.obtenerArchivosSesion
);

module.exports = router;