const express = require('express');
const router = express.Router();
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const agendaController = require('../controllers/agendaController');

router.post(
    '/crearCita',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    agendaController.crearCita
);

router.get(
    '/obtenerCitas',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    agendaController.obtenerCitas
);

router.get(
    '/transporte', 
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave, 
    agendaController.obtenerCitasConTransporte
);

router.put(
    '/actualizarCita/:id',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    agendaController.actualizarCita
);

router.put(
    '/eliminarCita/:id',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    agendaController.eliminarCita
);

module.exports = router;