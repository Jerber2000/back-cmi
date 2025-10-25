// src/middlewares/validacionDocumentos.js

const validarCrearDocumento = (req, res, next) => {
  try {
    const { nombredocumento, fkclinica } = req.body;
    const archivo = req.file;

    // Validar nombre del documento
    if (!nombredocumento || nombredocumento.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'El nombre del documento es requerido'
      });
    }

    if (nombredocumento.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del documento debe tener al menos 3 caracteres'
      });
    }

    if (nombredocumento.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del documento no debe exceder 200 caracteres'
      });
    }

    // Validar clínica (campo requerido)
    if (!fkclinica) {
      return res.status(400).json({
        success: false,
        message: 'La clínica es requerida'
      });
    }

    if (isNaN(parseInt(fkclinica)) || parseInt(fkclinica) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de clínica inválido'
      });
    }

    // Validar archivo
    if (!archivo) {
      return res.status(400).json({
        success: false,
        message: 'Debe adjuntar un archivo'
      });
    }

    // Validar descripción (opcional pero con límite)
    if (req.body.descripcion && req.body.descripcion.trim().length > 500) {
      return res.status(400).json({
        success: false,
        message: 'La descripción no debe exceder 500 caracteres'
      });
    }

    next();
  } catch (error) {
    console.error('Error en validarCrearDocumento:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error en la validación de datos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const validarActualizarDocumento = (req, res, next) => {
  try {
    const { nombredocumento, fkclinica } = req.body;

    // Validar nombre si se proporciona
    if (nombredocumento !== undefined) {
      if (nombredocumento.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El nombre del documento no puede estar vacío'
        });
      }

      if (nombredocumento.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del documento debe tener al menos 3 caracteres'
        });
      }

      if (nombredocumento.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: 'El nombre del documento no debe exceder 200 caracteres'
        });
      }
    }

    // Validar clínica si se proporciona
    if (fkclinica !== undefined) {
      if (isNaN(parseInt(fkclinica)) || parseInt(fkclinica) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'ID de clínica inválido'
        });
      }
    }

    // Validar descripción si se proporciona
    if (req.body.descripcion !== undefined && req.body.descripcion !== null) {
      if (req.body.descripcion.trim().length > 500) {
        return res.status(400).json({
          success: false,
          message: 'La descripción no debe exceder 500 caracteres'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error en validarActualizarDocumento:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error en la validación de datos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const validarIdDocumento = (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id)) || parseInt(id) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'ID de documento inválido'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en validarIdDocumento:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error en la validación del ID',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const validarCambioEstado = (req, res, next) => {
  try {
    const { estado } = req.body;
    
    if (estado === undefined || estado === null) {
      return res.status(400).json({
        success: false,
        message: 'El estado es requerido'
      });
    }

    const estadoNum = parseInt(estado);
    
    if (isNaN(estadoNum) || (estadoNum !== 0 && estadoNum !== 1)) {
      return res.status(400).json({
        success: false,
        message: 'El estado debe ser 0 (inactivo) o 1 (activo)'
      });
    }
    
    next();
  } catch (error) {
    console.error('Error en validarCambioEstado:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error en la validación del estado',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const validarParametrosBusqueda = (req, res, next) => {
  try {
    const { estado, fkclinica } = req.query;

    // Validar estado si se proporciona
    if (estado !== undefined) {
      const estadoNum = parseInt(estado);
      if (isNaN(estadoNum) || (estadoNum !== 0 && estadoNum !== 1)) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro estado debe ser 0 o 1'
        });
      }
    }

    // Validar fkclinica si se proporciona
    if (fkclinica !== undefined) {
      const clinicaNum = parseInt(fkclinica);
      if (isNaN(clinicaNum) || clinicaNum <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El parámetro fkclinica debe ser un número válido'
        });
      }
    }

    // Validar busqueda si se proporciona
    if (req.query.busqueda !== undefined) {
      if (req.query.busqueda.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: 'El término de búsqueda no debe exceder 200 caracteres'
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error en validarParametrosBusqueda:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error en la validación de parámetros',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  validarCrearDocumento,
  validarActualizarDocumento,
  validarIdDocumento,
  validarCambioEstado,
  validarParametrosBusqueda
};