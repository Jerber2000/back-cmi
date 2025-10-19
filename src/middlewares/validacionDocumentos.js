const validarCrearDocumento = (req, res, next) => {
  try {
    const { nombredocumento } = req.body;
    const archivo = req.file;

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

    if (!archivo) {
      return res.status(400).json({
        success: false,
        message: 'Debe adjuntar un archivo PDF'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en la validación de datos'
    });
  }
};

const validarActualizarDocumento = (req, res, next) => {
  try {
    const { nombredocumento } = req.body;

    if (nombredocumento !== undefined && nombredocumento.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'El nombre debe tener al menos 3 caracteres'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error en la validación'
    });
  }
};

const validarIdDocumento = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({
      success: false,
      message: 'ID inválido'
    });
  }
  next();
};

const validarCambioEstado = (req, res, next) => {
  const { estado } = req.body;
  if (estado === undefined || (estado !== 0 && estado !== 1)) {
    return res.status(400).json({
      success: false,
      message: 'Estado debe ser 0 o 1'
    });
  }
  next();
};

const validarParametrosBusqueda = (req, res, next) => {
  next();
};

module.exports = {
  validarCrearDocumento,
  validarActualizarDocumento,
  validarIdDocumento,
  validarCambioEstado,
  validarParametrosBusqueda
};