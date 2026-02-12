
const { verificarToken } = require('../utils/jwt');
const { prisma } = require('../config/prisma');
const authService = require('../services/authService');

const validarToken = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : null;

    if(!token){
        return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido. Formato: "Authorization: Bearer <token>"'
        });
    }

    try{
        const decoded = verificarToken(token);
        
        const sesionValida = await authService.verificarSesionActiva(
            decoded.id, 
            decoded.timestamp
        );
        
        if (!sesionValida) {
            return res.status(401).json({
                success: false,
                message: 'Tu sesión fue cerrada porque iniciaste sesión en otro dispositivo',
                sessionCerrada: true
            });
        }
        
        req.usuario = decoded;
        next(); 
    }catch(error){
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const verificarUsuarioEnBD = async (req, res, next) => {
    
    try{
        const idusuario = req.usuario.id || req.usuario.idusuario;
        
        if(!idusuario){
            return res.status(401).json({
                success: false,
                message: 'Token no contiene ID de usuario válido'
            });
        }

        const usuario = await prisma.usuario.findFirst({
            where:{
                idusuario: parseInt(idusuario),
                estado: 1
            },
            select:{
                idusuario:    true,
                usuario:      true,
                correo:       true,
                nombres:      true,
                apellidos:    true,
                fkrol:        true,
                fkclinica:    true,
                estado:       true,
                cambiarclave: true
            }
        });

        if(!usuario){
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }

        //agregar datos del usuario al request 
        req.usuario = {
            ...req.usuario,
            ...usuario
        };

        next();
    }catch(error){
        return res.status(500).json({
            success: false,
            message: 'Error al verificar usuario midd validacion',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
  validarToken,
  verificarUsuarioEnBD
};