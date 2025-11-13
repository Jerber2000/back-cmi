const express = require('express');
const router = express.Router();
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const agendaController = require('../controllers/agendaController');
const checkRole = require('../middlewares/checkRole');

router.post(
    '/crearCita',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    agendaController.crearCita
);

router.get(
    '/obtenerCitas',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    agendaController.obtenerCitas
);

router.get(
    '/transporte', 
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave, 
    checkRole(1,5,8), // admin,sistemas,auxiliar-admon
    agendaController.obtenerCitasConTransporte
);

router.put(
    '/actualizarCita/:id',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    agendaController.actualizarCita
);

router.put(
    '/eliminarCita/:id',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    checkRole(1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16),
    agendaController.eliminarCita
);

module.exports = router;