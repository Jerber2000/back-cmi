// src/controllers/authController.js
const authService = require('../services/authService');
const emailService = require('../services/EmailService');

const login = async (req, res) => {
    try{
        const { usuario, clave } = req.body;

        const resultado = await authService.login(usuario, clave);

        if (resultado.cambiarClave) {
            return res.status(200).json({
                success: true,
                cambiarClave: true,
                message: 'Debes cambiar tu contraseña temporal',
                data: resultado
            });
        }

        res.status(200).json({
            success: true,
            message: 'Login exitoso',
            data: resultado
        });
    } catch(error) {
        console.error('Error en AuthController.login:', error.message);

        let statusCode = 500;
        let message = error.message;
        
        if(error.message.includes('Ya tienes una sesión activa')){
            statusCode = 409;
            message = error.message;
        } else if(error.message === 'Credenciales inválidas'){
            statusCode = 401;
        } else if(error.message.includes('inactivo')){
            statusCode = 403; 
        }

        res.status(statusCode).json({
            success: false,
            message: message,
            sessionActiva: error.message.includes('Ya tienes una sesión activa')
        });
    }
};

const logout = async (req, res) => {
    try {
        const idusuario = req.usuario?.id || req.usuario?.idusuario;
        
        if (idusuario) {
            await authService.cerrarSesion(idusuario);
            
            res.status(200).json({
                success: true,
                message: 'Logout exitoso. Sesión cerrada correctamente.'
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Logout exitoso.'
            });
        }
    } catch (error) {
        console.error('Error en AuthController.logout:', error.message);
        res.status(500).json({
            success: false,
            message: 'Error al cerrar sesión'
        });
    }
};

const RecuperarClave = async (req, res) => {
    try{
        // ✅ DEBUG: Ver qué está llegando
        console.log('📧 RecuperarClave - Headers:', req.headers);
        console.log('📧 RecuperarClave - Body completo:', JSON.stringify(req.body));
        console.log('📧 RecuperarClave - Correo extraído:', req.body.correo);
        console.log('📧 RecuperarClave - Tipo de body:', typeof req.body);
        
        const { correo } = req.body;

        // ✅ Validación adicional por si acaso
        if (!correo || correo.trim() === '') {
            console.log('❌ Correo vacío o undefined');
            return res.status(400).json({
                success: false,
                message: 'El correo electrónico es requerido'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(correo)) {
            console.log('❌ Formato de correo inválido:', correo);
            return res.status(400).json({
                success: false,
                message: 'Formato de correo electrónico inválido'
            });
        }

        console.log('✅ Correo válido, llamando a emailService.ResetearClave...');
        await emailService.ResetearClave(correo);

        console.log('✅ Email enviado exitosamente');
        res.status(200).json({
            success: true,
            message: 'Se ha enviado una contraseña temporal a tu correo electrónico'
        });
        
    } catch(error) {
        console.error('❌ Error en AuthController.RecuperarClave:', error.message);
        console.error('❌ Stack:', error.stack);
        
        let statusCode = 500;
        let message = 'Error interno del servidor';
        
        if (error.message === 'Credenciales inválidas') {
            statusCode = 400;
            message = 'El correo electrónico no está registrado en nuestro sistema';
        } else if (error.message.includes('inactivo')) {
            statusCode = 403;
            message = 'Usuario inactivo. Contacte al administrador';
        }
        
        res.status(statusCode).json({
            success: false,
            message: message
        });
    }
};

const CambiarClaveTemporal = async (req, res) => {
    try {
        const { usuario, claveActual, claveNueva, confirmarClave } = req.body;

        if (claveNueva !== confirmarClave) {
            return res.status(400).json({
                success: false,
                message: 'Las contraseñas no coinciden'
            });
        }

        const resultado = await authService.cambiarClaveObligatoria(usuario, claveActual, claveNueva);

        res.status(200).json({
            success: true,
            message: 'Contraseña actualizada correctamente.',
            data: resultado
        });

    } catch (error) {
        console.error('Error en AuthController.CambiarClaveTemporary:', error.message);
        
        let statusCode = 500;
        let message = 'Error interno del servidor';
        
        if (error.message === 'Usuario no encontrado') {
            statusCode = 404;
            message = 'Usuario no encontrado';
        } else if (error.message === 'Contraseña actual incorrecta') {
            statusCode = 400;
            message = 'La contraseña temporal es incorrecta';
        } else if (error.message === 'No es necesario cambiar la contraseña') {
            statusCode = 400;
            message = 'No tienes una contraseña temporal pendiente de cambio';
        } else if (error.message.includes('La contraseña debe')) {
            statusCode = 400;
            message = error.message;
        }
        
        res.status(statusCode).json({
            success: false,
            message: message
        });
    }
};

module.exports = {
    login,
    logout,
    RecuperarClave,
    CambiarClaveTemporal
};