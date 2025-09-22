const express = require('express');
const router = express.Router();
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const agendaController = require('../controllers/agendaController');

router.post(
    '/crearCita',
    // autenticacion.validarToken,
    // autenticacion.verificarUsuarioEnBD,
    // validarCambioClave,
    agendaController.crearCita
);

module.exports = router;