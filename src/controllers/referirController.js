// src/controllers/referirController.js
const referirService = require('../services/referirService');

const referirController = {
  
  // POST /referir - Crear nuevo referido
  async crearReferido(req, res) {
    try {
      const {
        fkpaciente,
        fkexpediente,
        fkclinica,
        fkusuariodestino,
        comentario,
        rutadocumentoinicial 
      } = req.body;

      // Validaciones básicas
      if (!fkpaciente || !fkexpediente || !fkclinica || !fkusuariodestino) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Faltan campos requeridos'
        });
      }

      // El usuario que crea viene del token JWT
      const fkusuario = req.usuario.idusuario;
      const usuariocreacion = req.usuario.usuario;

      const nuevoReferido = await referirService.crearReferido({
        fkusuario,
        fkusuariodestino,
        fkpaciente,
        fkexpediente,
        fkclinica,
        comentario,
        usuariocreacion,
        rutadocumentoinicial 
      });

      return res.status(201).json({
        ok: true,
        mensaje: 'Referido creado exitosamente',
        data: nuevoReferido
      });

    } catch (error) {
      console.error('Error en crearReferido:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al crear el referido',
        error: error.message
      });
    }
  },

  // GET /referir - Listar referidos según rol y filtros
  async obtenerReferidos(req, res) {
    try {
      const { 
        tipo,  // 'pendientes', 'completados', 'enviados', 'recibidos'
        search,
        page = 1,
        limit = 10
      } = req.query;

      const usuario = req.usuario;

      const referidos = await referirService.obtenerReferidos({
        tipo,
        usuario,
        search,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      return res.status(200).json({
        ok: true,
        data: referidos.data,
        pagination: referidos.pagination
      });

    } catch (error) {
      console.error('Error en obtenerReferidos:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener referidos',
        error: error.message
      });
    }
  },

  // GET /referir/:id - Obtener detalle de un referido
  async obtenerReferidoPorId(req, res) {
    try {
      const { id } = req.params;
      const usuario = req.usuario;

      const referido = await referirService.obtenerReferidoPorId(
        parseInt(id),
        usuario
      );

      if (!referido) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Referido no encontrado'
        });
      }

      return res.status(200).json({
        ok: true,
        data: referido
      });

    } catch (error) {
      console.error('Error en obtenerReferidoPorId:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener el referido',
        error: error.message
      });
    }
  },

  // PUT /referir/:id/confirmar - Confirmar/aprobar un referido
  async confirmarReferido(req, res) {
    try {
      const { id } = req.params;
      const { comentario } = req.body;
      const usuario = req.usuario;

      const resultado = await referirService.confirmarReferido(
        parseInt(id),
        usuario,
        comentario
      );

      return res.status(200).json({
        ok: true,
        mensaje: resultado.mensaje,
        data: resultado.referido
      });

    } catch (error) {
      console.error('Error en confirmarReferido:', error);
      
      if (error.message.includes('no tiene permisos') || 
          error.message.includes('no autorizado')) {
        return res.status(403).json({
          ok: false,
          mensaje: error.message
        });
      }

      return res.status(500).json({
        ok: false,
        mensaje: 'Error al confirmar el referido',
        error: error.message
      });
    }
  },

  // PUT /referir/:id - Actualizar datos del referido (solo antes de completar)
  async actualizarReferido(req, res) {
    try {
      const { id } = req.params;
      const {
        fkclinica,
        fkusuariodestino,
        comentario
      } = req.body;
      
      const usuario = req.usuario;

      const referidoActualizado = await referirService.actualizarReferido(
        parseInt(id),
        {
          fkclinica,
          fkusuariodestino,
          comentario
        },
        usuario
      );

      return res.status(200).json({
        ok: true,
        mensaje: 'Referido actualizado exitosamente',
        data: referidoActualizado
      });

    } catch (error) {
      console.error('Error en actualizarReferido:', error);
      
      if (error.message.includes('no puede modificar')) {
        return res.status(403).json({
          ok: false,
          mensaje: error.message
        });
      }

      return res.status(500).json({
        ok: false,
        mensaje: 'Error al actualizar el referido',
        error: error.message
      });
    }
  },

  // PUT /referir/:id/estado - Cambiar estado (eliminado lógico)
  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body; // 0 = inactivo, 1 = activo
      const usuario = req.usuario;

      if (estado === undefined || estado === null) {
        return res.status(400).json({
          ok: false,
          mensaje: 'El campo estado es requerido'
        });
      }

      const referidoActualizado = await referirService.cambiarEstado(
        parseInt(id),
        estado,
        usuario
      );

      return res.status(200).json({
        ok: true,
        mensaje: estado === 1 ? 'Referido activado' : 'Referido eliminado',
        data: referidoActualizado
      });

    } catch (error) {
      console.error('Error en cambiarEstado:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al cambiar el estado',
        error: error.message
      });
    }
  },

  async obtenerHistorialPaciente(req, res) {
    try {
      const { idPaciente } = req.params;

      const historial = await referirService.obtenerHistorialPaciente(
        parseInt(idPaciente)
      );

      return res.status(200).json({
        ok: true,
        data: historial
      });

    } catch (error) {
      console.error('Error en obtenerHistorialPaciente:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al obtener el historial',
        error: error.message
      });
    }
  }

};

module.exports = referirController;
