const agendaService = require('../services/agendaService');

const crearCita = async (req, res) => {
    try{
        const citaData = req.body;
        const resultado = await agendaService.crearCita(citaData);

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

const obtenerCitas = async (req, res) => {
    try{
        const resultado = await agendaService.obtenerCitas();

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

const obtenerCitasConTransporte = async (req, res) => {
    try {
        // Obtener la fecha del query param o usar fecha actual
        const { fecha } = req.query;
        
        // Validar formato de fecha si se proporciona
        if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return res.status(400).json({
                success: false,
                message: 'Formato de fecha inválido. Use YYYY-MM-DD'
            });
        }

        const resultado = await agendaService.obtenerCitasConTransporte(fecha);
        
        return res.status(200).json(resultado);
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

const actualizarCita = async (req, res) => {
    try{
        const { id } = req.params;
        const citaData = req.body;
        
        const resultado = await agendaService.actualizarCita(id, citaData);

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

const eliminarCita = async (req, res) => {
    try{
        const { id } = req.params;
        const { usuariomodificacion } = req.body;
        
        const resultado = await agendaService.eliminarCita(id, usuariomodificacion);

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

module.exports = {
    crearCita,
    obtenerCitas,
    obtenerCitasConTransporte,
    actualizarCita,
    eliminarCita
};