// controllers/expedienteController.js
const ExpedienteService = require('../services/expedienteService');

class ExpedienteController {
  /**
   * Genera un número de expediente automático
   */
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
      console.error('❌ Error en generarNumeroExpediente:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Obtiene todos los expedientes con paginación, búsqueda y filtro por clínica
   */
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
      console.error('❌ Error en obtenerTodosLosExpedientes:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Obtiene un expediente específico por su ID
   */
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
      console.error('❌ Error en obtenerExpedientePorId:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Crea un nuevo expediente médico
   */
  static async crearExpediente(req, res) {
    try {
      const usuario = req.usuario?.usuario || 'sistema';
      const datosExpediente = req.body;

      const resultado = await ExpedienteService.crearExpediente(datosExpediente, usuario);

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

  /**
   * Actualiza un expediente existente
   */
  static async actualizarExpediente(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.usuario || 'sistema';
      const datosActualizacion = req.body;

      const resultado = await ExpedienteService.actualizarExpediente(
        id,
        datosActualizacion,
        usuario
      );

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

  /**
   * Elimina lógicamente un expediente
   */
  static async eliminarExpediente(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.usuario || 'sistema';

      console.log('🗑️ Intentando eliminar expediente ID:', id);

      const resultado = await ExpedienteService.eliminarExpediente(id, usuario);

      if (!resultado.success) {
        const statusCode = resultado.message === 'Expediente no encontrado' ? 404 : 409;
        return res.status(statusCode).json({
          exito: false,
          mensaje: resultado.message,
          detalles: resultado.details || undefined
        });
      }

      console.log('✅ Expediente eliminado exitosamente');

      res.json({
        exito: true,
        mensaje: resultado.message,
        datos: resultado.data
      });
    } catch (error) {
      console.error('❌ Error en eliminarExpediente:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor al eliminar expediente',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Obtiene expedientes disponibles (sin paciente asignado)
   */
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
      console.error('❌ Error en obtenerExpedientesDisponibles:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Obtiene estadísticas de expedientes
   */
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
      console.error('❌ Error en obtenerEstadisticas:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
}

module.exports = ExpedienteController;