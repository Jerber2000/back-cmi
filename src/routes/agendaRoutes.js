const express = require('express');
const router = express.Router();
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const agendaController = require('../controllers/agendaController');
const { verificarPermiso } = require('../middlewares/checkPermiso');

const auth = [autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave];
const perm = verificarPermiso('agenda');

router.post('/crearCita',                    ...auth, perm, agendaController.crearCita);
router.get('/obtenerCitas',                  ...auth, perm, agendaController.obtenerCitas);
router.get('/transporte',                    ...auth, perm, agendaController.obtenerCitasConTransporte);
router.put('/actualizarCita/:id',            ...auth, perm, agendaController.actualizarCita);
router.put('/eliminarCita/:id',              ...auth, perm, agendaController.eliminarCita);
router.post('/crearCitaRecurrente',          ...auth, perm, agendaController.crearCitaRecurrente);
router.put('/cancelarCitaRecurrente/:id',    ...auth, perm, agendaController.cancelarCitaRecurrente);
router.put('/cancelarSerieCompleta/:id',     ...auth, perm, agendaController.cancelarSerieCompleta);
router.get('/detallesSerieRecurrente/:id',   ...auth, perm, agendaController.obtenerDetallesSerieRecurrente);
router.put('/actualizarEstado/:id',          ...auth, perm, agendaController.actualizarEstadoCita);

module.exports = router;
