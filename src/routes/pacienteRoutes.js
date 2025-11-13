// routes/pacienteRoutes.js
const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/pacienteController');
const autenticacion = require('../middlewares/auth');
const { validarPaciente, validarIdPaciente, validarActualizacionPaciente } = require('../middlewares/validaPaciente');
const checkRole = require('../middlewares/checkRole');
const clinicaService = require('../services/clinicaService');

/**
 * Rutas para la gestión de pacientes
 */

// GET /api/pacientes - Obtener todos los pacientes con paginación y búsqueda
router.get('/', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    PacienteController.obtenerTodosLosPacientes
);

// GET /api/pacientes/disponibles - Obtener pacientes disponibles para asignación
router.get('/disponibles', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    PacienteController.obtenerPacientesDisponibles
);

// GET /api/pacientes/estadisticas - Obtener estadísticas de pacientes
router.get('/estadisticas', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    PacienteController.obtenerEstadisticas
);

// GET /api/pacientes/obtenerListado - Obtener listado simple de pacientes
router.get('/obtenerListado',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    PacienteController.listadoPacientes
);

// GET /api/pacientes/clinicas - Obtener lista de clínicas disponibles
router.get('/clinicas',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
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

// GET /api/pacientes/:id - Obtener un paciente específico por ID
router.get('/:id', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarIdPaciente,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    PacienteController.obtenerPacientePorId
);

// POST /api/pacientes - Crear nuevo paciente
router.post('/', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarPaciente,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    PacienteController.crearPaciente
);

// PUT /api/pacientes/:id - Actualizar paciente existente
router.put('/:id', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarIdPaciente,
    validarActualizacionPaciente,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    PacienteController.actualizarPaciente
);

// DELETE /api/pacientes/:id - Eliminar paciente (eliminación lógica)
router.delete('/:id', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarIdPaciente,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    PacienteController.eliminarPaciente
);

module.exports = router;