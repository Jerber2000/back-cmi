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

// Reportes generales — requieren permiso de página 'reporteria'
router.get('/dashboard',   verificarPermiso('reporteria'), reporteriaController.obtenerDashboard);
router.get('/pacientes',   validarReporteria.validarFiltrosPacientes,  verificarPermiso('reporteria'), reporteriaController.obtenerReportePacientes);
router.get('/consultas',   validarReporteria.validarFiltrosConsultas,  verificarPermiso('reporteria'), reporteriaController.obtenerReporteConsultas);
router.get('/agenda',      validarReporteria.validarFiltrosAgenda,     verificarPermiso('reporteria'), reporteriaController.obtenerReporteAgenda);
router.get('/referencias', validarReporteria.validarFiltrosReferencias,verificarPermiso('reporteria'), reporteriaController.obtenerReporteReferencias);

// Reportes de inventario — requieren permiso de inventario
router.get('/inventario',  validarReporteria.validarFiltrosInventario, verificarPermiso('inventario'), reporteriaController.obtenerReporteInventario);
router.get('/salidas',     validarReporteria.validarFiltrosSalidas,    verificarPermiso('salida-inventario'), reporteriaController.obtenerReporteSalidas);

// Exportación — requieren permiso de reporteria
router.post('/generar-pdf',    validarReporteria.validarGeneracionPDF,   verificarPermiso('reporteria'), reporteriaController.generarPDF);
router.post('/exportar-excel', validarReporteria.validarExportacionExcel,verificarPermiso('reporteria'), reporteriaController.exportarExcel);

module.exports = router;
