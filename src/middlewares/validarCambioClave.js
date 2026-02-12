const authService = require('../services/authService');

const validarCambioClave = async (req, res, next) => {
    try {
        const cambiarClave = req.usuario?.cambiarClave;
        
        if (cambiarClave === true) {
            return res.status(200).json({
                success: false,
                cambiarClave: true,
                message: 'Debes cambiar tu contraseña temporal antes de continuar'
            });
        }

        next(); 
    } catch (error) {
        console.error('Error en middleware checkPasswordChange:', error);
        next(); 
    }
};

module.exports = { validarCambioClave };