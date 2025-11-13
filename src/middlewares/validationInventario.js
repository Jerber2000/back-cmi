// src/middlewares/validationInventario.js

class InventarioMiddleware {
  // Validar ID en parámetros
  validarId(req, res, next) {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'El ID es requerido'
      });
    }
    
    const idNumero = parseInt(id);
    
    if (isNaN(idNumero) || idNumero <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El ID debe ser un número válido mayor a 0'
      });
    }
    
    next();
  }

  // Validar datos al CREAR
  validarCrear(req, res, next) {
    const { fkusuario, nombre, codigoproducto, usuariocreacion } = req.body;
    const errores = [];

    // Campos obligatorios
    if (!fkusuario || fkusuario <= 0) {
      errores.push('El campo fkusuario es obligatorio y debe ser mayor a 0');
    }

    if (!nombre || nombre.trim() === '') {
      errores.push('El campo nombre es obligatorio');
    }

    if (nombre && nombre.length > 200) {
      errores.push('El nombre no puede exceder 200 caracteres');
    }

    if (!usuariocreacion || usuariocreacion.trim() === '') {
      errores.push('El campo usuariocreacion es obligatorio');
    }

    // Validación de código de producto (opcional pero con formato)
    if (codigoproducto) {
      if (codigoproducto.trim() === '') {
        errores.push('El código de producto no puede estar vacío');
      }
      if (codigoproducto.length > 50) {
        errores.push('El código de producto no puede exceder 50 caracteres');
      }
    }

    // Validaciones opcionales
    if (req.body.unidades !== undefined && req.body.unidades < 0) {
      errores.push('Las unidades no pueden ser negativas');
    }

    if (req.body.precio !== undefined && req.body.precio < 0) {
      errores.push('El precio no puede ser negativo');
    }

    if (errores.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errores
      });
    }

    next();
  }

  // Validar datos al ACTUALIZAR
  validarActualizar(req, res, next) {
    const { nombre, codigoproducto, usuariomodificacion } = req.body;
    const errores = [];

    if (!nombre || nombre.trim() === '') {
      errores.push('El campo nombre es obligatorio');
    }

    if (nombre && nombre.length > 200) {
      errores.push('El nombre no puede exceder 200 caracteres');
    }

    if (!usuariomodificacion || usuariomodificacion.trim() === '') {
      errores.push('El campo usuariomodificacion es obligatorio');
    }

    // Validación de código de producto (opcional pero con formato)
    if (codigoproducto !== undefined && codigoproducto !== null) {
      if (codigoproducto.trim() === '') {
        errores.push('El código de producto no puede estar vacío');
      }
      if (codigoproducto.length > 50) {
        errores.push('El código de producto no puede exceder 50 caracteres');
      }
    }

    if (req.body.unidades !== undefined && req.body.unidades < 0) {
      errores.push('Las unidades no pueden ser negativas');
    }

    if (req.body.precio !== undefined && req.body.precio < 0) {
      errores.push('El precio no puede ser negativo');
    }

    if (errores.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errores
      });
    }

    next();
  }

  // Validar cambio de estado
  validarCambiarEstado(req, res, next) {
    const { usuariomodificacion } = req.body;

    if (!usuariomodificacion || usuariomodificacion.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El campo usuariomodificacion es obligatorio'
      });
    }

    next();
  }
}

module.exports = new InventarioMiddleware();