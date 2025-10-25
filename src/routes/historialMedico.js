// routes/historialMedico.js

const express = require('express');
const router = express.Router();
const historialController = require('../controllers/historialMedicoController');
const { validarToken, verificarUsuarioEnBD } = require('../middlewares/auth');
const { fileService } = require('../services/fileService'); // ✅ CAMBIO 1
const {
    validarCrearSesion,
    validarActualizarSesion,
    validarPacienteId,
    validarHistorialId,
    validarSubirArchivos
} = require('../middlewares/validacionHistorialMedico');
const checkRole = require('../middlewares/checkRole');

// ✅ CAMBIO 2: Crear middleware genérico para historial médico
const uploadHistorial = fileService.createGenericMiddleware(['image', 'document'], 5);

// Aplicar autenticación a todas las rutas
router.use(validarToken);
router.use(verificarUsuarioEnBD);

// ✅ RUTAS CORREGIDAS PARA COINCIDIR CON EL APP.JS

// Obtener historial completo de un paciente
router.get('/paciente/:idpaciente', 
    validarPacienteId,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    historialController.obtenerHistorialPorPaciente
);

// Obtener info básica del paciente  
router.get('/info-paciente/:idpaciente', 
    validarPacienteId,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    historialController.obtenerInfoPaciente
);

// Crear nueva sesión
router.post('/crear-sesion', 
    validarCrearSesion,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    historialController.crearSesion
);

// Actualizar sesión
router.put('/actualizar-sesion/:idhistorial', 
    validarActualizarSesion,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    historialController.actualizarSesion
);

// ✅ CAMBIO 3: Usar uploadHistorial.array() en lugar de upload.array()
// Subir archivos para historial
router.post('/subir-archivos/:idpaciente',
    validarSubirArchivos,
    uploadHistorial.array('archivos', 5),
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    historialController.subirArchivos
);

// Actualizar archivos de sesión
router.put('/sesion/:idhistorial/archivos',
    validarHistorialId,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    historialController.actualizarSesionConArchivos
);

router.delete('/eliminar-sesion/:idhistorial',
    validarHistorialId,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    historialController.eliminarSesion
);

// Obtener archivos de sesión específica
router.get('/sesion/:idhistorial/archivos',
    validarHistorialId,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    historialController.obtenerArchivosSesion
);

module.exports = router;