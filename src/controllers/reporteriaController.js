const reporteriaService = require('../services/reporteriaService');

const reporteriaController = {

  async obtenerDashboard(req, res) {
    try {
      const usuario = req.usuario;

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

  async obtenerMedicosDisponibles(req, res) {
    try {
      const { contexto } = req.query;
      const medicos = await reporteriaService.obtenerMedicosDisponibles(contexto);

      return res.status(200).json({
        ok: true,
        data: medicos
      });

    } catch (error) {
      console.error('Error en obtenerMedicosDisponibles:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener médicos disponibles',
        error: error.message
      });
    }
  },

  async obtenerConfirmadoresReferidos(req, res) {
    try {
      const confirmadores = await reporteriaService.obtenerConfirmadoresReferidos();

      return res.status(200).json({
        ok: true,
        data: confirmadores
      });

    } catch (error) {
      console.error('Error en obtenerConfirmadoresReferidos:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener confirmadores de referidos',
        error: error.message
      });
    }
  },

  async obtenerReportePacientes(req, res) {
    try {
      const {
        nombre,
        cui,
        desde,
        hasta,
        genero,
        municipio,
        edadMin,
        edadMax,
        tipodiscapacidad,
        programa,
        fkclinica,
        page = 1,
        limit = 10
      } = req.query;

      const filtros = {
        nombre,
        cui,
        desde,
        hasta,
        genero,
        municipio,
        edadMin: edadMin ? parseInt(edadMin) : null,
        edadMax: edadMax ? parseInt(edadMax) : null,
        tipodiscapacidad,
        programa: programa ? parseInt(programa) : null,
        fkclinica: fkclinica ? parseInt(fkclinica) : null,
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

  async obtenerReporteSalidas(req, res) {
    try {
      const {
        desde,
        hasta,
        estado,
        medicamento,
        nombreMedicamento,
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
        nombreMedicamento,
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

  async obtenerReporteConsultas(req, res) {
    try {
      const {
        nombrePaciente,
        cuiPaciente,
        desde,
        hasta,
        medico,
        programa,
        diagnostico,
        page = 1,
        limit = 10
      } = req.query;

      const usuario = req.usuario;

      const filtros = {
        nombrePaciente,
        cuiPaciente,
        desde,
        hasta,
        medico: medico ? parseInt(medico) : null,
        programa: programa ? parseInt(programa) : null,
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

  async obtenerReporteInventario(req, res) {
    try {
      const {
        estado,
        stockMinimo,
        proximosVencer,
        usuario,
        nombreMedicamento,
        page = 1,
        limit = 10
      } = req.query;

      const filtros = {
        estado,
        stockMinimo: stockMinimo ? parseInt(stockMinimo) : null,
        proximosVencer: proximosVencer ? parseInt(proximosVencer) : null,
        usuario: usuario ? parseInt(usuario) : null,
        nombreMedicamento,
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

  async obtenerReporteAgenda(req, res) {
    try {
      const {
        nombrePaciente,
        cuiPaciente,
        desde,
        hasta,
        medico,
        transporte,
        estado,
        page = 1,
        limit = 10
      } = req.query;

      const usuario = req.usuario;

      // Procesamiento especial para estado (que puede ser array)
      let estadoProcessado = estado;
      if (estado) {
        // Si es string, convertir a array si es necesario
        if (typeof estado === 'string') {
          estadoProcessado = [estado];
        } else if (!Array.isArray(estado)) {
          estadoProcessado = [estado];
        }
        // Filtrar valores vacíos
        estadoProcessado = estadoProcessado.filter(e => e !== undefined && e !== null && e !== '');
      }

      const filtros = {
        nombrePaciente,
        cuiPaciente,
        desde,
        hasta,
        medico: medico ? parseInt(medico) : null,
        transporte: transporte !== undefined ? parseInt(transporte) : null,
        estado: estadoProcessado,
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

  async obtenerReporteReferencias(req, res) {
    try {
      const {
        nombrePaciente,
        cuiPaciente,
        tipo,
        estado,
        clinica,
        enviadoPor,
        confirmadoPor,
        desde,
        hasta,
        page = 1,
        limit = 10
      } = req.query;

      const usuario = req.usuario;

      const filtros = {
        nombrePaciente,
        cuiPaciente,
        tipo,
        estado,
        clinica: clinica ? parseInt(clinica) : null,
        enviadoPor: enviadoPor ? parseInt(enviadoPor) : null,
        confirmadoPor,
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