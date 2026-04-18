
const express = require('express');
const router = express.Router();

const reporteriaController = require('../controllers/reporteriaController');
const { validarToken, verificarUsuarioEnBD } = require('../middlewares/auth');
const validarReporteria = require('../middlewares/validarReporteria');
const checkRole = require('../middlewares/checkRole');

router.use(validarToken);
router.use(verificarUsuarioEnBD);

router.get('/dashboard',
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  reporteriaController.obtenerDashboard
);

router.get('/medicos',
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  reporteriaController.obtenerMedicosDisponibles
);

router.get('/pacientes',
  validarReporteria.validarFiltrosPacientes,
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  reporteriaController.obtenerReportePacientes
);

router.get('/consultas',
  validarReporteria.validarFiltrosConsultas,
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  reporteriaController.obtenerReporteConsultas
);

router.get('/inventario',
  validarReporteria.validarFiltrosInventario,
  checkRole(1,4,7,9),
  reporteriaController.obtenerReporteInventario
);

router.get('/agenda',
  validarReporteria.validarFiltrosAgenda,
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  reporteriaController.obtenerReporteAgenda
);

router.get('/referencias',
  validarReporteria.validarFiltrosReferencias,
  checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
  reporteriaController.obtenerReporteReferencias
);

router.get('/salidas',
  validarReporteria.validarFiltrosSalidas,
  checkRole(1,4,7,9),
  reporteriaController.obtenerReporteSalidas
);

router.post('/generar-pdf',
  validarReporteria.validarGeneracionPDF,
  reporteriaController.generarPDF
);

router.post('/exportar-excel',
  validarReporteria.validarExportacionExcel,
  reporteriaController.exportarExcel
);

module.exports = router;