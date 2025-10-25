// src/middlewares/validacionSalidas.js

class SalidasMiddleware {
  
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

  // Validar ID de medicamento en parámetros
  validarIdMedicamento(req, res, next) {
    const { idmedicina } = req.params;
    
    if (!idmedicina) {
      return res.status(400).json({
        success: false,
        message: 'El ID del medicamento es requerido'
      });
    }
    
    const idNumero = parseInt(idmedicina);
    
    if (isNaN(idNumero) || idNumero <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El ID del medicamento debe ser un número válido mayor a 0'
      });
    }
    
    next();
  }

  // Validar datos al CREAR salida
  validarCrear(req, res, next) {
    const { 
      fkmedicina, 
      fkusuario, 
      cantidad, 
      fechasalida, 
      usuariocreacion,
      motivo,
      destino,
      observaciones
    } = req.body;
    
    const errores = [];

    // ===== CAMPOS OBLIGATORIOS =====
    
    // fkmedicina
    if (!fkmedicina) {
      errores.push('El campo fkmedicina es obligatorio');
    } else if (typeof fkmedicina !== 'number' || fkmedicina <= 0) {
      errores.push('El campo fkmedicina debe ser un número mayor a 0');
    }

    // fkusuario
    if (!fkusuario) {
      errores.push('El campo fkusuario es obligatorio');
    } else if (typeof fkusuario !== 'number' || fkusuario <= 0) {
      errores.push('El campo fkusuario debe ser un número mayor a 0');
    }

    // cantidad
    if (cantidad === undefined || cantidad === null) {
      errores.push('El campo cantidad es obligatorio');
    } else if (typeof cantidad !== 'number' || cantidad <= 0) {
      errores.push('La cantidad debe ser un número mayor a 0');
    } else if (!Number.isInteger(cantidad)) {
      errores.push('La cantidad debe ser un número entero');
    }

    // fechasalida
    if (!fechasalida) {
      errores.push('El campo fechasalida es obligatorio');
    } else {
      const fecha = new Date(fechasalida);
      if (isNaN(fecha.getTime())) {
        errores.push('La fecha de salida no es válida');
      }
    }

    // usuariocreacion
    if (!usuariocreacion || usuariocreacion.trim() === '') {
      errores.push('El campo usuariocreacion es obligatorio');
    } else if (usuariocreacion.length > 100) {
      errores.push('El campo usuariocreacion no puede exceder 100 caracteres');
    }

    // ===== CAMPOS OPCIONALES (con validaciones de formato) =====
    
    // motivo
    if (motivo !== undefined && motivo !== null) {
      if (typeof motivo !== 'string') {
        errores.push('El campo motivo debe ser un texto');
      } else if (motivo.length > 200) {
        errores.push('El motivo no puede exceder 200 caracteres');
      }
    }

    // destino
    if (destino !== undefined && destino !== null) {
      if (typeof destino !== 'string') {
        errores.push('El campo destino debe ser un texto');
      } else if (destino.length > 200) {
        errores.push('El destino no puede exceder 200 caracteres');
      }
    }

    // observaciones
    if (observaciones !== undefined && observaciones !== null) {
      if (typeof observaciones !== 'string') {
        errores.push('El campo observaciones debe ser un texto');
      }
    }

    // Si hay errores, retornar respuesta 400
    if (errores.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores de validación',
        errores
      });
    }

    next();
  }

  // Validar datos al ANULAR salida
  validarAnular(req, res, next) {
    const { usuariomodificacion } = req.body;

    if (!usuariomodificacion || usuariomodificacion.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El campo usuariomodificacion es obligatorio'
      });
    }

    if (usuariomodificacion.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'El campo usuariomodificacion no puede exceder 100 caracteres'
      });
    }

    next();
  }

  // Validar filtros para listar (OPCIONAL - para uso futuro)
  validarFiltros(req, res, next) {
    const { estado, fechaDesde, fechaHasta } = req.query;

    const errores = [];

    // Validar estado si viene
    if (estado !== undefined) {
      const estadoNum = parseInt(estado);
      if (isNaN(estadoNum) || (estadoNum !== 0 && estadoNum !== 1)) {
        errores.push('El estado debe ser 0 (anulado) o 1 (activo)');
      }
    }

    // Validar fechas si vienen
    if (fechaDesde) {
      const fecha = new Date(fechaDesde);
      if (isNaN(fecha.getTime())) {
        errores.push('La fechaDesde no es válida');
      }
    }

    if (fechaHasta) {
      const fecha = new Date(fechaHasta);
      if (isNaN(fecha.getTime())) {
        errores.push('La fechaHasta no es válida');
      }
    }

    // Validar que fechaDesde sea menor que fechaHasta
    if (fechaDesde && fechaHasta) {
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      if (desde > hasta) {
        errores.push('La fechaDesde debe ser menor o igual a fechaHasta');
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Errores en los filtros',
        errores
      });
    }

    next();
  }
}

module.exports = new SalidasMiddleware();