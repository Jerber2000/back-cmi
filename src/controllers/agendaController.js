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

module.exports = {
    crearCita
};