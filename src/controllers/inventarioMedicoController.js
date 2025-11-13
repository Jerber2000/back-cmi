// src/controllers/inventarioMedicoController.js
const inventarioMedicoService = require('../services/inventarioMedicoService');

class InventarioMedicoController {
  // GET /api/inventario - Listar todos
  async listarTodos(req, res) {
    try {
      const medicamentos = await inventarioMedicoService.listarTodos();
      
      return res.status(200).json({
        success: true,
        data: medicamentos,
        total: medicamentos.length
      });
    } catch (error) {
      console.error('Error en InventarioMedicoController.listarTodos:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // GET /api/inventario/:id - Obtener por ID
  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const medicamento = await inventarioMedicoService.obtenerPorId(id);
      
      return res.status(200).json({
        success: true,
        data: medicamento
      });
    } catch (error) {
      console.error('Error en InventarioMedicoController.obtenerPorId:', error.message);
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // POST /api/inventario - Crear nuevo
  async crear(req, res) {
    try {
      const nuevoMedicamento = await inventarioMedicoService.crear(req.body);
      
      return res.status(201).json({
        success: true,
        message: 'Medicamento creado exitosamente',
        data: nuevoMedicamento
      });
    } catch (error) {
      console.error('Error en InventarioMedicoController.crear:', error.message);
      
      // Manejo especial para errores de validación
      const statusCode = error.message.includes('ya está registrado') ? 400 : 500;
      
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PUT /api/inventario/:id - Actualizar
  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const medicamentoActualizado = await inventarioMedicoService.actualizar(id, req.body);
      
      return res.status(200).json({
        success: true,
        message: 'Medicamento actualizado exitosamente',
        data: medicamentoActualizado
      });
    } catch (error) {
      console.error('Error en InventarioMedicoController.actualizar:', error.message);
      
      // Determinar código de estado apropiado
      let statusCode = 500;
      if (error.message.includes('no encontrado')) {
        statusCode = 404;
      } else if (error.message.includes('ya está registrado')) {
        statusCode = 400;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // PUT /api/inventario/:id/estado - Cambiar estado
  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { usuariomodificacion } = req.body;

      if (!usuariomodificacion) {
        return res.status(400).json({
          success: false,
          message: 'El campo usuariomodificacion es requerido'
        });
      }

      const resultado = await inventarioMedicoService.cambiarEstado(id, usuariomodificacion);
      
      return res.status(200).json({
        success: true,
        message: resultado.mensaje,
        data: resultado
      });
    } catch (error) {
      console.error('Error en InventarioMedicoController.cambiarEstado:', error.message);
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new InventarioMedicoController();