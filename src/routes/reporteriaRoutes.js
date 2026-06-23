const express = require('express');
const router = express.Router();
const reporteriaController = require('../controllers/reporteriaController');
const { validarToken, verificarUsuarioEnBD } = require('../middlewares/auth');
const validarReporteria = require('../middlewares/validarReporteria');
const { verificarPermiso } = require('../middlewares/checkPermiso');

router.use(validarToken);
router.use(verificarUsuarioEnBD);

// /medicos — utilidad para dropdowns de filtros
router.get('/medicos', reporteriaController.obtenerMedicosDisponibles);
router.get('/confirmadores-referidos', reporteriaController.obtenerConfirmadoresReferidos);

// Dashboard — requiere permiso general de la página 'reporteria'
router.get('/dashboard',   verificarPermiso('reporteria'), reporteriaController.obtenerDashboard);

// Reportes por pestaña — cada uno requiere su propio permiso granular,
// para poder dar acceso a Reportería sin dar acceso a todas las pestañas
// (ej: Farmacia solo ve la pestaña de Inventario)
router.get('/pacientes',   validarReporteria.validarFiltrosPacientes,  verificarPermiso('reporteria-pacientes'), reporteriaController.obtenerReportePacientes);
router.get('/consultas',   validarReporteria.validarFiltrosConsultas,  verificarPermiso('reporteria-historial'), reporteriaController.obtenerReporteConsultas);
router.get('/agenda',      validarReporteria.validarFiltrosAgenda,     verificarPermiso('reporteria-agenda'), reporteriaController.obtenerReporteAgenda);
router.get('/referencias', validarReporteria.validarFiltrosReferencias,verificarPermiso('reporteria-referencias'), reporteriaController.obtenerReporteReferencias);
router.get('/inventario',  validarReporteria.validarFiltrosInventario, verificarPermiso('reporteria-inventario'), reporteriaController.obtenerReporteInventario);
router.get('/salidas',     validarReporteria.validarFiltrosSalidas,    verificarPermiso('reporteria-inventario'), reporteriaController.obtenerReporteSalidas);

// Exportación — requieren permiso de reporteria
router.post('/generar-pdf',    validarReporteria.validarGeneracionPDF,   verificarPermiso('reporteria'), reporteriaController.generarPDF);
router.post('/exportar-excel', validarReporteria.validarExportacionExcel,verificarPermiso('reporteria'), reporteriaController.exportarExcel);

module.exports = router;
