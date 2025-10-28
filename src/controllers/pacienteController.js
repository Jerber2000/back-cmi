// controllers/pacienteController.js
const PacienteService = require('../services/pacienteService');

class PacienteController {
  /**
   * Obtiene todos los pacientes con paginación, búsqueda y filtro por clínica
   */
  static async obtenerTodosLosPacientes(req, res) {
    try {
      const { pagina = 1, limite = 10, busqueda = '', fkclinica = null } = req.query;

      const resultado = await PacienteService.obtenerTodosLosPacientes(
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
      console.error('❌ Error en obtenerTodosLosPacientes:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Obtiene listado simple de pacientes
   */
  static async listadoPacientes(req, res) {
    try {
      const resultado = await PacienteService.listadoPacientes();

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
      console.error('❌ Error en listadoPacientes:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Obtiene un paciente específico por su ID
   */
  static async obtenerPacientePorId(req, res) {
    try {
      const { id } = req.params;

      const resultado = await PacienteService.obtenerPacientePorId(id);

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
      console.error('❌ Error en obtenerPacientePorId:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Crea un nuevo paciente en el sistema
   */
  static async crearPaciente(req, res) {
    try {
      const usuario = req.usuario?.usuario || 'sistema';
      const datosPaciente = req.body;

      const resultado = await PacienteService.crearPaciente(datosPaciente, usuario);

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
      console.error('❌ Error en crearPaciente:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Actualiza la información de un paciente existente
   */
  static async actualizarPaciente(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.usuario || 'sistema';
      const datosActualizacion = req.body;

      const resultado = await PacienteService.actualizarPaciente(
        id,
        datosActualizacion,
        usuario
      );

      if (!resultado.success) {
        const statusCode = resultado.message === 'Paciente no encontrado' ? 404 : 400;
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
      console.error('❌ Error en actualizarPaciente:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Elimina lógicamente un paciente del sistema
   */
  static async eliminarPaciente(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario?.usuario || 'sistema';

      console.log('🗑️ Intentando eliminar paciente ID:', id);

      const resultado = await PacienteService.eliminarPaciente(id, usuario);

      if (!resultado.success) {
        const statusCode = resultado.message === 'Paciente no encontrado' ? 404 : 409;
        return res.status(statusCode).json({
          exito: false,
          mensaje: resultado.message,
          detalles: resultado.details || undefined
        });
      }

      console.log('✅ Paciente eliminado exitosamente');

      res.json({
        exito: true,
        mensaje: resultado.message,
        datos: resultado.data
      });
    } catch (error) {
      console.error('❌ Error en eliminarPaciente:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor al eliminar paciente',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Obtiene estadísticas básicas de los pacientes
   */
  static async obtenerEstadisticas(req, res) {
    try {
      const resultado = await PacienteService.obtenerEstadisticas();

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

  /**
   * Obtiene la lista de pacientes disponibles para asignación
   */
  static async obtenerPacientesDisponibles(req, res) {
    try {
      const resultado = await PacienteService.obtenerPacientesDisponibles();

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
      console.error('❌ Error en obtenerPacientesDisponibles:', error);
      res.status(500).json({
        exito: false,
        mensaje: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
}

module.exports = PacienteController;