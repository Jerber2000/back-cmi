// src/routes/reporteriaRoutes.js
const express = require('express');
const router = express.Router();

const reporteriaController = require('../controllers/reporteriaController');
const { validarToken, verificarUsuarioEnBD } = require('../middlewares/auth');
const validarReporteria = require('../middlewares/validarReporteria');
const checkRole = require('../middlewares/checkRole');

// Todas las rutas requieren autenticación
router.use(validarToken);
router.use(verificarUsuarioEnBD);

// GET /api/reporteria/dashboard - Estadísticas generales del sistema
router.get('/dashboard',
  checkRole(1,5),
  reporteriaController.obtenerDashboard
);

// GET /api/reporteria/pacientes - Reporte de pacientes con filtros
router.get('/pacientes',
  validarReporteria.validarFiltrosPacientes,
  checkRole(1,5),
  reporteriaController.obtenerReportePacientes
);

// GET /api/reporteria/consultas - Reporte de consultas médicas
router.get('/consultas',
  validarReporteria.validarFiltrosConsultas,
  checkRole(1,5),
  reporteriaController.obtenerReporteConsultas
);

// GET /api/reporteria/inventario - Reporte de inventario médico
router.get('/inventario',
  validarReporteria.validarFiltrosInventario,
  checkRole(1,5),
  reporteriaController.obtenerReporteInventario
);

// GET /api/reporteria/agenda - Reporte de agenda/citas
router.get('/agenda',
  validarReporteria.validarFiltrosAgenda,
  checkRole(1,5),
  reporteriaController.obtenerReporteAgenda
);

// GET /api/reporteria/referencias - Reporte de referencias
router.get('/referencias',
  validarReporteria.validarFiltrosReferencias,
  checkRole(1,5),
  reporteriaController.obtenerReporteReferencias
);

// POST /api/reporteria/generar-pdf - Generar PDF de cualquier reporte
router.post('/generar-pdf',
  validarReporteria.validarGeneracionPDF,
  reporteriaController.generarPDF
);

// POST /api/reporteria/exportar-excel - Exportar a Excel
router.post('/exportar-excel',
  validarReporteria.validarExportacionExcel,
  reporteriaController.exportarExcel
);

module.exports = router;