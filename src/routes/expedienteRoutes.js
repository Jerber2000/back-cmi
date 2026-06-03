const express = require('express');
const router = express.Router();
const ExpedienteController = require('../controllers/expedienteController');
const autenticacion = require('../middlewares/auth');
const { validarExpediente, validarIdExpediente } = require('../middlewares/validaExpediente');
const { verificarPermiso } = require('../middlewares/checkPermiso');
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const auth = [autenticacion.validarToken, autenticacion.verificarUsuarioEnBD];
const perm = verificarPermiso('expedientes');

// Clínicas — utilidad para dropdowns
router.get('/clinicas', ...auth, async (req, res) => {
    try {
        const clinicas = await prisma.clinica.findMany({
            where: { estado: 1 },
            select: { idclinica: true, nombreclinica: true },
            orderBy: { nombreclinica: 'asc' }
        });
        res.json({ exito: true, datos: clinicas });
    } catch (error) {
        res.status(500).json({ exito: false, mensaje: 'Error al obtener clínicas' });
    }
});

router.get('/',                ...auth, perm, ExpedienteController.obtenerTodosLosExpedientes);
router.get('/disponibles',     ...auth, perm, ExpedienteController.obtenerExpedientesDisponibles);
router.get('/generar-numero',  ...auth, perm, ExpedienteController.generarNumeroExpediente);
router.get('/estadisticas',    ...auth, perm, ExpedienteController.obtenerEstadisticas);
router.get('/:id',             ...auth, validarIdExpediente, perm, ExpedienteController.obtenerExpedientePorId);
router.post('/',               ...auth, validarExpediente, perm, ExpedienteController.crearExpediente);
router.put('/:id',             ...auth, validarIdExpediente, validarExpediente, perm, ExpedienteController.actualizarExpediente);
router.delete('/:id',          ...auth, validarIdExpediente, perm, ExpedienteController.eliminarExpediente);

module.exports = router;
