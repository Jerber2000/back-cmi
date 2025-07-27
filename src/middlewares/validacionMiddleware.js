const { body, param, validationResult } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Errores de validación',
            errors: errors.array()
        });
    }
    next();
};

// Validación para resetear contraseña (mantener como estaba)
const validarResetearPass = [
    body('correo')
    .isEmail()
    .normalizeEmail()
    .withMessage('correo inválido'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Datos inválidos',
            details: errors.array()
        });
        }
        next();
    }
];

// Validaciones para crear/actualizar paciente
const validarPaciente = [
  body('nombres')
    .notEmpty()
    .withMessage('Los nombres son obligatorios')
    .isLength({ min: 2, max: 100 })
    .withMessage('Los nombres deben tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los nombres solo pueden contener letras y espacios'),

  body('apellidos')
    .notEmpty()
    .withMessage('Los apellidos son obligatorios')
    .isLength({ min: 2, max: 100 })
    .withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage('Los apellidos solo pueden contener letras y espacios'),

  body('cui')
    .notEmpty()
    .withMessage('El CUI es obligatorio')
    .isLength({ min: 13, max: 13 })
    .withMessage('El CUI debe tener exactamente 13 dígitos')
    .isNumeric()
    .withMessage('El CUI debe contener solo números'),

  body('fechanacimiento')
    .notEmpty()
    .withMessage('La fecha de nacimiento es obligatoria')
    .isISO8601()
    .withMessage('La fecha de nacimiento debe tener un formato válido')
    .custom((value) => {
      const fecha = new Date(value);
      const hoy = new Date();
      const hace150Anos = new Date();
      hace150Anos.setFullYear(hoy.getFullYear() - 150);

      if (fecha > hoy) {
        throw new Error('La fecha de nacimiento no puede ser futura');
      }
      if (fecha < hace150Anos) {
        throw new Error('La fecha de nacimiento no puede ser mayor a 150 años');
      }
      return true;
    }),

  body('genero')
    .notEmpty()
    .withMessage('El género es obligatorio')
    .isIn(['M', 'F'])
    .withMessage('El género debe ser M (Masculino) o F (Femenino)'),

  body('tipoconsulta')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El tipo de consulta no puede exceder 100 caracteres'),

  body('tipodiscapacidad')
    .optional()
    .isLength({ max: 150 })
    .withMessage('El tipo de discapacidad no puede exceder 150 caracteres'),

  body('telefonopersonal')
    .optional()
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage('El teléfono personal debe contener solo números y símbolos válidos')
    .isLength({ max: 20 })
    .withMessage('El teléfono personal no puede exceder 20 caracteres'),

  body('nombrecontactoemergencia')
    .optional()
    .isLength({ max: 150 })
    .withMessage('El nombre del contacto de emergencia no puede exceder 150 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)
    .withMessage('El nombre del contacto de emergencia solo puede contener letras y espacios'),

  body('telefonoemergencia')
    .optional()
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage('El teléfono de emergencia debe contener solo números y símbolos válidos')
    .isLength({ max: 20 })
    .withMessage('El teléfono de emergencia no puede exceder 20 caracteres'),

  body('nombreencargado')
    .optional()
    .isLength({ max: 150 })
    .withMessage('El nombre del encargado no puede exceder 150 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/)
    .withMessage('El nombre del encargado solo puede contener letras y espacios'),

  body('dpiencargado')
    .optional()
    .isLength({ max: 20 })
    .withMessage('El DPI del encargado no puede exceder 20 caracteres')
    .matches(/^[0-9\s]*$/)
    .withMessage('El DPI del encargado debe contener solo números'),

  body('telefonoencargado')
    .optional()
    .matches(/^[0-9+\-\s()]*$/)
    .withMessage('El teléfono del encargado debe contener solo números y símbolos válidos')
    .isLength({ max: 20 })
    .withMessage('El teléfono del encargado no puede exceder 20 caracteres'),

  body('municipio')
    .optional()
    .isLength({ max: 100 })
    .withMessage('El municipio no puede exceder 100 caracteres'),

  body('aldea')
    .optional()
    .isLength({ max: 100 })
    .withMessage('La aldea no puede exceder 100 caracteres'),

  body('direccion')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres'),

  // Validaciones para el expediente (opcionales al crear paciente)
  body('numeroexpediente')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('El número de expediente debe tener entre 1 y 50 caracteres'),

  body('historiaenfermedad')
    .optional()
    .isLength({ max: 5000 })
    .withMessage('La historia de enfermedad no puede exceder 5000 caracteres'),

  body('antmedico')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los antecedentes médicos no pueden exceder 2000 caracteres'),

  body('antmedicamento')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los antecedentes de medicamentos no pueden exceder 2000 caracteres'),

  body('anttraumaticos')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los antecedentes traumáticos no pueden exceder 2000 caracteres'),

  body('antfamiliar')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los antecedentes familiares no pueden exceder 2000 caracteres'),

  body('antalergico')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Los antecedentes alérgicos no pueden exceder 2000 caracteres'),

  handleValidationErrors
];

// Validaciones para crear usuario
const validarUsuarioCreacion = [
    body('correo')
        .isEmail()
        .normalizeEmail()
        .withMessage('El correo electronico debe ser válido'),
    body('usuario')
        .isLength({min: 6, max: 20})
        .withMessage('El usuario debe contar con al menos 6 caracteres y maximo 20 caracteres')
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('El usuario no debe tener espacios, caracteres especiales ni números'),
    body('clave')
        .isLength({ min: 8, max: 12 })
        .withMessage('La clave debe tener al menos 8 caracteres y maximo 12 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).+$/)
        .withMessage('La clave debe contener al menos una mayúscula, una minúscula, un caracter especial y un número'),
    body('nombres')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Nombre debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Nombre solo puede contener letras y espacios'),
    handleValidationErrors
];

// Validaciones para actualizar usuario
const validarUsuarioActualizar = [
    param('idusuario')
        .isInt({ min: 1 })
        .withMessage('ID debe ser un número entero válido'),
    body('correo')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('El correo electronico debe ser válido'),
    body('usuario')
        .isLength({min: 6, max: 20})
        .withMessage('El usuario debe contar con al menos 6 caracteres y maximo 20 caracteres')
        .matches(/^[a-zA-Z0-9]+$/)
        .withMessage('El usuario no debe tener espacios, caracteres especiales ni números'),
    body('clave')
        .optional()
        .isLength({ min: 8, max: 12 })
        .withMessage('La clave debe tener al menos 8 caracteres y maximo 12 caracteres')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).+$/)
        .withMessage('La clave debe contener al menos una mayúscula, una minúscula, un caracter especial y un número'),
    body('nombres')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Nombre debe tener entre 2 y 50 caracteres')
        .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .withMessage('Nombre solo puede contener letras y espacios'),
    handleValidationErrors
];

// Validación para parámetros de ID
const validateUsuarioId = [
    param('idusuario')
        .isInt({ min: 1 })
        .withMessage('ID debe ser un número entero válido'),
    handleValidationErrors
];

module.exports = {
  validarPaciente,
  validarUsuarioCreacion,
  validarResetearPass,
  validarUsuarioActualizar,
  validateUsuarioId
};