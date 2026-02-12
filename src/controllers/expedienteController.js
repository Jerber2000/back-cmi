const expedienteService = require('../services/expedienteService');
const ExpedienteService = require('../services/expedienteService');
const { conAuditoria } = require('../utils/auditoria.helper');

class ExpedienteController {

  static async generarNumeroExpediente(req, res) {
    try {
      const resultado = await ExpedienteService.generarNumeroExpediente();

      if (!resultado.success) {
        return res.status(400).json({
          exito: false,
          mensaje: resultado.message
        });
      }

      res.json({
        exito: true,
        datos: resultado.data
      });
    } catch (error) {
      console.error('Error en generarNumeroExpediente:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
  
  static async obtenerTodosLosExpedientes(req, res) {
    try {
      const { pagina = 1, limite = 10, busqueda = '', fkclinica = null } = req.query;

      const resultado = await ExpedienteService.obtenerTodosLosExpedientes(
        pagina,
        limite,
        busqueda,
        fkclinica
      );

      if (!resultado.success) {
        return res.status(400).json({
          exito: false,
          mensaje: resultado.message
        });
      }

      res.json({
        exito: true,
        datos: resultado.data,
        paginacion: resultado.pagination
      });
    } catch (error) {
      console.error('Error en obtenerTodosLosExpedientes:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  static async obtenerExpedientePorId(req, res) {
    try {
      const { id } = req.params;

      const resultado = await ExpedienteService.obtenerExpedientePorId(id);

      if (!resultado.success) {
        return res.status(404).json({
          exito: false,
          mensaje: resultado.message
        });
      }

      res.json({
        exito: true,
        datos: resultado.data
      });
    } catch (error) {
      console.error('Error en obtenerExpedientePorId:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  static async crearExpediente(req, res) {
    try {
      const usuario = req.usuario?.usuario || 'sistema';
      const datosExpediente = req.body;

      const resultado = await conAuditoria(req, 'expediente', async (tx) =>{
        return await expedienteService.crearExpediente(datosExpediente, usuario, tx);
      });

      if (!resultado.success) {
        return res.status(400).json({
          exito: false,
          mensaje: resultado.message
        });
      }

      res.status(201).json({
        exito: true,
        mensaje: resultado.message,
        datos: resultado.data
      });
    } catch (error) {
      console.error('❌ Error en crearExpediente:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
  
  static async actualizarExpediente(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.usuario || 'sistema';
      const datosActualizacion = req.body;

      const resultado = await conAuditoria(req, 'expediente', async (tx) =>{
        return await ExpedienteService.actualizarExpediente(id, datosActualizacion,usuario,tx);
      });

      if (!resultado.success) {
        const statusCode = resultado.message === 'Expediente no encontrado' ? 404 : 400;
        return res.status(statusCode).json({
          exito: false,
          mensaje: resultado.message
        });
      }

      res.json({
        exito: true,
        mensaje: resultado.message,
        datos: resultado.data
      });
    } catch (error) {
      console.error('❌ Error en actualizarExpediente:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  static async eliminarExpediente(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.usuario || 'sistema';

      const resultado = await conAuditoria(req, 'expediente', async (tx) => {
        return await ExpedienteService.eliminarExpediente(id, usuario, tx);
      });

      if (!resultado.success) {
        const statusCode = resultado.message === 'Expediente no encontrado' ? 404 : 409;
        return res.status(statusCode).json({
          exito: false,
          mensaje: resultado.message,
          detalles: resultado.details || undefined
        });
      }

      res.json({
        exito: true,
        mensaje: resultado.message,
        datos: resultado.data
      });
    } catch (error) {
      console.error('Error en eliminarExpediente:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor al eliminar expediente',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  static async obtenerExpedientesDisponibles(req, res) {
    try {
      const resultado = await ExpedienteService.obtenerExpedientesDisponibles();

      if (!resultado.success) {
        return res.status(400).json({
          exito: false,
          mensaje: resultado.message
        });
      }

      res.json({
        exito: true,
        datos: resultado.data
      });
    } catch (error) {
      console.error('Error en obtenerExpedientesDisponibles:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  static async obtenerEstadisticas(req, res) {
    try {
      const resultado = await ExpedienteService.obtenerEstadisticas();

      if (!resultado.success) {
        return res.status(400).json({
          exito: false,
          mensaje: resultado.message
        });
      }

      res.json({
        exito: true,
        datos: resultado.data
      });
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
}

module.exports = ExpedienteController;