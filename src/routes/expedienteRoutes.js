const express = require('express');
const router = express.Router();
const ExpedienteController = require('../controllers/expedienteController');
const autenticacion = require('../middlewares/auth');
const { validarExpediente, validarIdExpediente } = require('../middlewares/validaExpediente');
const checkRole = require('../middlewares/checkRole');
const clinicaService = require('../services/clinicaService');

router.get('/', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    ExpedienteController.obtenerTodosLosExpedientes
);

router.get('/disponibles', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    ExpedienteController.obtenerExpedientesDisponibles
);

router.get('/generar-numero', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    ExpedienteController.generarNumeroExpediente
);

router.get('/estadisticas', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    ExpedienteController.obtenerEstadisticas
);

router.get('/clinicas',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    async (req, res) => {
        try {
            const { prisma } = require('../config/prisma');
            
            const clinicas = await prisma.clinica.findMany({
                where: { estado: 1 },
                select: {
                    idclinica: true,
                    nombreclinica: true
                },
                orderBy: { nombreclinica: 'asc' }
            });
            
            res.json({
                exito: true,
                datos: clinicas
            });
        } catch (error) {
            res.status(500).json({ 
                exito: false,
                mensaje: 'Error al obtener clínicas',
                error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
            });
        }
    }
);

router.get('/:id', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarIdExpediente,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    ExpedienteController.obtenerExpedientePorId
);

router.post('/', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarExpediente,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    ExpedienteController.crearExpediente
);

router.put('/:id', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarIdExpediente,
    validarExpediente,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    ExpedienteController.actualizarExpediente
);

router.delete('/:id', 
    autenticacion.validarToken, 
    autenticacion.verificarUsuarioEnBD, 
    validarIdExpediente,
    checkRole(1,2,3,4,5,6,7,8,10,11,12,13,14,15,16),
    ExpedienteController.eliminarExpediente
);

module.exports = router;