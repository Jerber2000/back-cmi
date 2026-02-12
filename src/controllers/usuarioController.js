const usuarioService = require('../services/usuarioService');
const { conAuditoria } = require('../utils/auditoria.helper');

const obtenerUsuarios = async (req, res) => {
    try{
        const resultado = await usuarioService.obtenerUsuarios();

        if(resultado.success){
            res.status(200).json(resultado);
        }else{
            res.status(400).json(resultado);
        }
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const obtenerUsuarioPorId = async (req, res) => {
    try{
        const { idusuario } = req.params;
        const resultado = await usuarioService.obtenerUsuarioPorId(idusuario);

        if(resultado.success){
            res.status(200).json(resultado);
        }else{
            res.status(404).json(resultado);
        }
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const obtenerUsuarioPorRol = async (req, res) => {
    try {
        const { rol } = req.params;
        
        const resultado = await usuarioService.obtenerUsuarioPorRol(rol);
        
        if (!resultado.success) {
            return res.status(404).json(resultado);
        }
        
        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
}

const crearUsuario = async (req, res) => {
    try{
        const usuarioData = req.body;
        const usuario = req.usuario?.usuario || 'sistema';
        
        const resultado = await conAuditoria(req, 'usuario', async (tx) =>{
            return await usuarioService.crearUsuario(usuarioData, usuario, tx);
        });

        if(resultado.success){
            res.status(201).json(resultado);
        }else{
            res.status(400).json(resultado);
        }
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const actuarlizarUsuario = async (req, res) => {
    try{
        const { idusuario } = req.params;
        const updateData = req.body;
        const usuario = req.usuario?.usuario || 'sistema';
        
        const resultado = await conAuditoria(req, 'usuario', async (tx) =>{
            return await usuarioService.actualizarUsuario(idusuario, updateData, usuario, tx);
        });

        if(resultado.success){
            res.status(200).json(resultado);
        }else{
            res.status(400).json(resultado);
        }
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const eliminarUsuario = async (req, res) => {
    try{
        const { idusuario } = req.params;
        const usuario = req.usuario?.usuario || 'sistema';
        
        const resultado = await conAuditoria(req, 'usuario', async (tx) => {
            return await usuarioService.eliminarUsuario(idusuario, usuario, tx);
        });

        if(resultado.success){
            res.status(200).json(resultado);
        }else{
            res.status(400).json(resultado);
        }
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const obtenerPerfil = async (req, res) => {
    try {
        const idusuario = req.usuario.idusuario;
        const resultado = await usuarioService.obtenerUsuarioPorId(idusuario);

        if (resultado.success) {
            res.status(200).json(resultado);
        } else {
            res.status(404).json(resultado);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const actualizarPerfil = async (req, res) => {
    try {
        const idusuario = req.usuario.idusuario;
        const updateData = req.body;
        const usuario = req.usuario?.usuario || 'sistema';

        if (req.usuario.fkrol !== 1) {
            delete updateData.fkrol;
        }

        const resultado = await conAuditoria(req, 'usuario', async (tx) => {
            return await usuarioService.actualizarUsuario(idusuario, updateData, usuario,tx);
        });

        if (resultado.success) {
            res.status(200).json(resultado);
        } else {
            res.status(400).json(resultado);
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    obtenerUsuarios,
    obtenerUsuarioPorId,
    obtenerUsuarioPorRol,
    crearUsuario,
    actuarlizarUsuario,
    eliminarUsuario,
    obtenerPerfil,
    actualizarPerfil
};