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
    checkRole(1,4,5), // adminitrador, recepcionista, sistemas
    agendaController.crearCita
);

router.get(
    '/obtenerCitas',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    checkRole(1,2,4,5,6,7), // admin, medico-general,recepcionista,sistemas,fisioterapia, psicologo
    agendaController.obtenerCitas
);

router.get(
    '/transporte', 
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave, 
    checkRole(1,4,5), // admin,recepcionista,sistemas
    agendaController.obtenerCitasConTransporte
);

router.put(
    '/actualizarCita/:id',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    checkRole(1,4,5), // admin, recepcionista, sistema
    agendaController.actualizarCita
);

router.put(
    '/eliminarCita/:id',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    checkRole(1,4,5), // admin, recepcionista,sistemas
    agendaController.eliminarCita
);

module.exports = router;