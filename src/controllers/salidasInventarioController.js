const salidasInventarioService = require('../services/salidasInventarioService');

class SalidasInventarioController {
  
  async listarTodas(req, res) {
    try {
      const salidas = await salidasInventarioService.listarTodas();
      
      return res.status(200).json({
        success: true,
        data: salidas,
        total: salidas.length
      });
    } catch (error) {
      console.error('Error en SalidasInventarioController.listarTodas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async obtenerPorId(req, res) {
    try {
      const { id } = req.params;
      const salida = await salidasInventarioService.obtenerPorId(id);
      
      return res.status(200).json({
        success: true,
        data: salida
      });
    } catch (error) {
      console.error('Error en SalidasInventarioController.obtenerPorId:', error.message);
      const statusCode = error.message.includes('no encontrada') ? 404 : 500;
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async obtenerPorMedicamento(req, res) {
    try {
      const { idmedicina } = req.params;
      const salidas = await salidasInventarioService.obtenerPorMedicamento(idmedicina);
      
      return res.status(200).json({
        success: true,
        data: salidas,
        total: salidas.length
      });
    } catch (error) {
      console.error('Error en SalidasInventarioController.obtenerPorMedicamento:', error.message);
      
      let statusCode = 500;
      if (error.message.includes('no encontrado')) {
        statusCode = 404;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async crear(req, res) {
    try {
      const resultado = await salidasInventarioService.crear(req.body);
      
      return res.status(201).json({
        success: true,
        message: resultado.mensaje,
        data: resultado
      });
    } catch (error) {
      console.error('Error en SalidasInventarioController.crear:', error.message);
      
      let statusCode = 500;
      if (error.message.includes('no encontrado')) {
        statusCode = 404;
      } else if (
        error.message.includes('inactivo') || 
        error.message.includes('insuficiente') ||
        error.message.includes('Stock')
      ) {
        statusCode = 400;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async anular(req, res) {
    try {
      const { id } = req.params;
      const { usuariomodificacion } = req.body;

      if (!usuariomodificacion) {
        return res.status(400).json({
          success: false,
          message: 'El campo usuariomodificacion es requerido'
        });
      }

      const resultado = await salidasInventarioService.anular(id, usuariomodificacion);
      
      return res.status(200).json({
        success: true,
        message: resultado.mensaje,
        data: resultado
      });
    } catch (error) {
      console.error('Error en SalidasInventarioController.anular:', error.message);
      
      let statusCode = 500;
      if (error.message.includes('no encontrada')) {
        statusCode = 404;
      } else if (error.message.includes('ya está anulada')) {
        statusCode = 400;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: error.message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async obtenerEstadisticas(req, res) {
    try {
      const estadisticas = await salidasInventarioService.obtenerEstadisticas();
      
      return res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error en SalidasInventarioController.obtenerEstadisticas:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new SalidasInventarioController();