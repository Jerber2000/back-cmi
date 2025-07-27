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
  validarUsuarioCreacion,
  validarResetearPass,
  validarUsuarioActualizar,
  validateUsuarioId
};