// src/controllers/reporteriaController.js
const reporteriaService = require('../services/reporteriaService');

const reporteriaController = {

  // GET /api/reporteria/dashboard - Estadísticas generales
  async obtenerDashboard(req, res) {
    try {
      const usuario = req.usuario;

      // ✅ Llama al método único del service
      const dashboard = await reporteriaService.obtenerDashboard(usuario);

      return res.status(200).json({
        ok: true,
        data: dashboard
      });

    } catch (error) {
      console.error('Error en obtenerDashboard:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener estadísticas del dashboard',
        error: error.message
      });
    }
  },

  // GET /api/reporteria/pacientes - Reporte de pacientes
  async obtenerReportePacientes(req, res) {
    try {
      const {
        desde,
        hasta,
        genero,
        municipio,
        edadMin,
        edadMax,
        tipodiscapacidad,
        page = 1,
        limit = 10
      } = req.query;

      const filtros = {
        desde,
        hasta,
        genero,
        municipio,
        edadMin: edadMin ? parseInt(edadMin) : null,
        edadMax: edadMax ? parseInt(edadMax) : null,
        tipodiscapacidad,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const reporte = await reporteriaService.obtenerReportePacientes(filtros);

      return res.status(200).json({
        ok: true,
        data: reporte.data,
        pagination: reporte.pagination,
        resumen: reporte.resumen
      });

    } catch (error) {
      console.error('Error en obtenerReportePacientes:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener reporte de pacientes',
        error: error.message
      });
    }
  },

  // GET /api/reporteria/salidas - Reporte de salidas de inventario
  async obtenerReporteSalidas(req, res) {
    try {
      const {
        desde,
        hasta,
        estado,
        medicamento,
        usuario: usuarioFiltro,
        motivo,
        destino,
        page = 1,
        limit = 10
      } = req.query;

      const usuario = req.usuario;

      const filtros = {
        desde,
        hasta,
        estado,
        medicamento: medicamento ? parseInt(medicamento) : null,
        usuarioFiltro: usuarioFiltro ? parseInt(usuarioFiltro) : null,
        motivo,
        destino,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const reporte = await reporteriaService.obtenerReporteSalidas(filtros, usuario);

      return res.status(200).json({
        ok: true,
        data: reporte.data,
        pagination: reporte.pagination,
        resumen: reporte.resumen
      });

    } catch (error) {
      console.error('Error en obtenerReporteSalidas:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener reporte de salidas',
        error: error.message
      });
    }
  },

  // GET /api/reporteria/consultas - Reporte de consultas
  async obtenerReporteConsultas(req, res) {
    try {
      const {
        desde,
        hasta,
        medico,
        paciente,
        diagnostico,
        page = 1,
        limit = 10
      } = req.query;

      const usuario = req.usuario;

      const filtros = {
        desde,
        hasta,
        medico: medico ? parseInt(medico) : null,
        paciente: paciente ? parseInt(paciente) : null,
        diagnostico,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const reporte = await reporteriaService.obtenerReporteConsultas(filtros, usuario);

      return res.status(200).json({
        ok: true,
        data: reporte.data,
        pagination: reporte.pagination,
        resumen: reporte.resumen
      });

    } catch (error) {
      console.error('Error en obtenerReporteConsultas:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener reporte de consultas',
        error: error.message
      });
    }
  },

  // GET /api/reporteria/inventario - Reporte de inventario
  async obtenerReporteInventario(req, res) {
    try {
      const {
        estado,
        stockMinimo,
        proximosVencer,
        usuario,
        page = 1,
        limit = 10
      } = req.query;

      const filtros = {
        estado,
        stockMinimo: stockMinimo ? parseInt(stockMinimo) : null,
        proximosVencer: proximosVencer ? parseInt(proximosVencer) : null,
        usuario: usuario ? parseInt(usuario) : null,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const reporte = await reporteriaService.obtenerReporteInventario(filtros);

      return res.status(200).json({
        ok: true,
        data: reporte.data,
        pagination: reporte.pagination,
        resumen: reporte.resumen,
        alertas: reporte.alertas
      });

    } catch (error) {
      console.error('Error en obtenerReporteInventario:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener reporte de inventario',
        error: error.message
      });
    }
  },

  // GET /api/reporteria/agenda - Reporte de agenda
  async obtenerReporteAgenda(req, res) {
    try {
      const {
        desde,
        hasta,
        medico,
        mes,
        anio,
        transporte,
        page = 1,
        limit = 10
      } = req.query;

      const usuario = req.usuario;

      const filtros = {
        desde,
        hasta,
        medico: medico ? parseInt(medico) : null,
        mes: mes ? parseInt(mes) : null,
        anio: anio ? parseInt(anio) : null,
        transporte: transporte !== undefined ? parseInt(transporte) : null,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const reporte = await reporteriaService.obtenerReporteAgenda(filtros, usuario);

      return res.status(200).json({
        ok: true,
        data: reporte.data,
        pagination: reporte.pagination,
        resumen: reporte.resumen
      });

    } catch (error) {
      console.error('Error en obtenerReporteAgenda:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener reporte de agenda',
        error: error.message
      });
    }
  },

  // GET /api/reporteria/referencias - Reporte de referencias
  async obtenerReporteReferencias(req, res) {
    try {
      const {
        tipo,
        estado,
        clinica,
        medico,
        desde,
        hasta,
        page = 1,
        limit = 10
      } = req.query;

      const usuario = req.usuario;

      const filtros = {
        tipo,
        estado,
        clinica: clinica ? parseInt(clinica) : null,
        medico: medico ? parseInt(medico) : null,
        desde,
        hasta,
        page: parseInt(page),
        limit: parseInt(limit)
      };

      const reporte = await reporteriaService.obtenerReporteReferencias(filtros, usuario);

      return res.status(200).json({
        ok: true,
        data: reporte.data,
        pagination: reporte.pagination,
        resumen: reporte.resumen
      });

    } catch (error) {
      console.error('Error en obtenerReporteReferencias:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener reporte de referencias',
        error: error.message
      });
    }
  },

  // POST /api/reporteria/generar-pdf - Generar PDF
  async generarPDF(req, res) {
    try {
      const { tipoReporte, filtros, titulo } = req.body;

      if (!tipoReporte) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El campo tipoReporte es requerido'
        });
      }

      const usuario = req.usuario;

      const pdfBuffer = await reporteriaService.generarPDF({
        tipoReporte,
        filtros: filtros || {},
        titulo: titulo || `Reporte de ${tipoReporte}`,
        usuario
      });

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=reporte_${tipoReporte}_${Date.now()}.pdf`);
      
      return res.send(pdfBuffer);

    } catch (error) {
      console.error('Error en generarPDF:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al generar PDF',
        error: error.message
      });
    }
  },

  // POST /api/reporteria/exportar-excel - Exportar a Excel
  async exportarExcel(req, res) {
    try {
      const { tipoReporte, filtros, nombreArchivo } = req.body;

      if (!tipoReporte) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El campo tipoReporte es requerido'
        });
      }

      const usuario = req.usuario;

      const excelBuffer = await reporteriaService.exportarExcel({
        tipoReporte,
        filtros: filtros || {},
        nombreArchivo: nombreArchivo || `reporte_${tipoReporte}`,
        usuario
      });

      // Configurar headers para descarga
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${nombreArchivo || 'reporte'}_${Date.now()}.xlsx`);
      
      return res.send(excelBuffer);

    } catch (error) {
      console.error('Error en exportarExcel:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al exportar a Excel',
        error: error.message
      });
    }
  }

};

module.exports = reporteriaController;