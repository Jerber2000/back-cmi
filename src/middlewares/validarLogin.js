//exporta la libreria joi
const Joi = require('joi');

const validarLogin = (req, res, next) => {
    const schema = Joi.object({
        correo: Joi.string()
            .email()
            .required()
            .messages({  
                'string.email': 'Debe ser un correo electronico válido',
                'any.required': 'El correo electronico es requerido'
            }),
        clave: Joi.string()
            .min(8)
            .max(12)
            .required()
            .messages({  
                'string.min': 'La contraseña debe tener almenos 8 caracteres',
                'any.required': 'La contraseña es requerida'
            })
    });

    const {error} = schema.validate(req.body);

    if(error){
        return res.status(400).json({
            success: false,
            message: 'Datos de entrada inválidos',
            errors: error.details.map(detail => detail.message)
        });
    }

    next();
};

module.exports = validarLogin; 