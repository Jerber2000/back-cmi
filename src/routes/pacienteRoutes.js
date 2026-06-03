const express = require('express');
const router = express.Router();
const PacienteController = require('../controllers/pacienteController');
const autenticacion = require('../middlewares/auth');
const { validarPaciente, validarIdPaciente, validarActualizacionPaciente } = require('../middlewares/validaPaciente');
const clinicaService = require('../services/clinicaService');
const { verificarPermiso } = require('../middlewares/checkPermiso');

const auth = [autenticacion.validarToken, autenticacion.verificarUsuarioEnBD];
const perm = verificarPermiso('pacientes');

// Clínicas — utilidad para dropdowns, accesible a todos
router.get('/clinicas', ...auth, async (req, res) => {
    try {
        const clinicas = await clinicaService.consultarClinica();
        res.json(clinicas);
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al obtener clínicas' });
    }
});

router.get('/',           ...auth, perm, PacienteController.obtenerTodosLosPacientes);
router.get('/disponibles',...auth, perm, PacienteController.obtenerPacientesDisponibles);
router.get('/estadisticas',...auth, perm, PacienteController.obtenerEstadisticas);
router.get('/obtenerListado',...auth, perm, PacienteController.listadoPacientes);
router.get('/:id',        ...auth, validarIdPaciente, perm, PacienteController.obtenerPacientePorId);
router.post('/',          ...auth, validarPaciente, perm, PacienteController.crearPaciente);
router.put('/:id',        ...auth, validarIdPaciente, validarActualizacionPaciente, perm, PacienteController.actualizarPaciente);
router.delete('/:id',     ...auth, validarIdPaciente, perm, PacienteController.eliminarPaciente);

module.exports = router;
