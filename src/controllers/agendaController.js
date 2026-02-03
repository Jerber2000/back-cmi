const agendaService = require('../services/agendaService');
const { conAuditoria } = require('../utils/auditoria.helper');

const crearCita = async (req, res) => {
    try{
        const citaData = req.body;
        const usuario = req.usuario?.usuario || 'sistema';

        //const resultado = await agendaService.crearCita(citaData);
        const resultado = await conAuditoria(req, 'agenda', async (tx) => {
            return await agendaService.crearCita(citaData, tx);
        });

        res.status(200).json(resultado);
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
        res.status(200).json(resultado);
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
        const { fecha } = req.query;
        
        if (fecha && !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
            return res.status(200).json({
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
        const usuario = req.usuario?.usuario || 'sistema';
        
        //const resultado = await agendaService.actualizarCita(id, citaData);
        const resultado = await conAuditoria(req, 'agenda', async (tx) => {
            return await agendaService.actualizarCita(id, citaData, tx);
        });

        res.status(200).json(resultado);
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

       // const resultado = await agendaService.eliminarCita(id, usuariomodificacion);
        const resultado = await conAuditoria(req, 'agenda', async (tx) => {
            return await agendaService.eliminarCita(id, usuariomodificacion, tx);
        });

        res.status(200).json(resultado);
    }catch(error){
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const crearCitaRecurrente = async (req, res) => {
    try {
        const datosRecurrentes = req.body;
        
        const resultado = await agendaService.crearCitaRecurrente(datosRecurrentes);
       
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const cancelarCitaRecurrente = async (req, res) => {
    try {
        const { id } = req.params;
        const { usuariomodificacion } = req.body;
        
        //const resultado = await agendaService.cancelarCitaRecurrente(id, usuariomodificacion);
        const resultado = await conAuditoria(req, 'agenda', async (tx) => {
            return await agendaService.cancelarCitaRecurrente(
                id, usuariomodificacion, tx
            );
        });

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const cancelarSerieCompleta = async (req, res) => {
    try {
        const { id } = req.params; // idagenda_recurrente
        const { usuariomodificacion } = req.body;
        
        const resultado = await agendaService.cancelarSerieCompleta(id, usuariomodificacion);
        
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const obtenerDetallesSerieRecurrente = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await agendaService.obtenerDetallesSerieRecurrente(id);
        res.status(200).json(resultado);
    } catch (error) {
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
    eliminarCita,
    crearCitaRecurrente,
    cancelarCitaRecurrente,
    cancelarSerieCompleta,
    obtenerDetallesSerieRecurrente
};