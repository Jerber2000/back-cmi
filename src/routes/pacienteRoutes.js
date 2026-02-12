
const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/pacienteController');
const autenticacion = require('../middlewares/auth');
const { validarPaciente, validarIdPaciente, validarActualizacionPaciente } = require('../middlewares/validaPaciente');
const checkRole = require('../middlewares/checkRole');
const clinicaService = require('../services/clinicaService');

router.get('/', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    PacienteController.obtenerTodosLosPacientes
);

router.get('/disponibles', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    PacienteController.obtenerPacientesDisponibles
);

router.get('/estadisticas', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    PacienteController.obtenerEstadisticas
);

router.get('/obtenerListado',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    PacienteController.listadoPacientes
);

router.get('/clinicas',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    async (req, res) => {
        try {
            const clinicas = await clinicaService.consultarClinica();
            res.json(clinicas);
        } catch (error) {
            res.status(500).json({ 
                exito: false,
                mensaje: 'Error al obtener clínicas',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
            });
        }
    }
);

router.get('/:id', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarIdPaciente,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    PacienteController.obtenerPacientePorId
);

router.post('/', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarPaciente,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    PacienteController.crearPaciente
);

router.put('/:id', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarIdPaciente,
    validarActualizacionPaciente,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    PacienteController.actualizarPaciente
);

router.delete('/:id', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarIdPaciente,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    PacienteController.eliminarPaciente
);

module.exports = router;