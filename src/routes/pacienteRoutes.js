// routes/pacienteRoutes.js
const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/pacienteController');
const autenticacion = require('../middlewares/auth');
const { validarPaciente } = require('../middlewares/validacionMiddleware');

// GET /api/pacientes - Obtener todos los pacientes con paginación y búsqueda
router.get('/', autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, PacienteController.getAllPacientes);

// GET /api/pacientes/:id - Obtener un paciente por ID
router.get('/:id', autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, PacienteController.getPacienteById);

// POST /api/pacientes - Crear nuevo paciente
router.post('/', autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarPaciente, PacienteController.createPaciente);

// PUT /api/pacientes/:id - Actualizar paciente
router.put('/:id', autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarPaciente, PacienteController.updatePaciente);

// DELETE /api/pacientes/:id - Eliminar paciente (soft delete)
router.delete('/:id', autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, PacienteController.deletePaciente);

module.exports = router;