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
      return res.status(500).json({
        success: false,
        message: error.message
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
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
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
      return res.status(500).json({
        success: false,
        message: error.message
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
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  // PATCH /api/inventario/:id/estado - Cambiar estado
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
      const statusCode = error.message.includes('no encontrado') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new InventarioMedicoController();