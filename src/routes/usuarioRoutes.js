const express = require('express');
const router = express.Router();
const { obtenerUsuarios, obtenerUsuarioPorId, obtenerUsuarioPorRol, obtenerProfesionalesAgenda, crearUsuario, actuarlizarUsuario, eliminarUsuario } = require('../controllers/usuarioController');
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const { validarUsuarioCreacion, validarUsuarioActualizar } = require('../middlewares/validacionMiddleware');
const RolService = require('../services/rolService');
const clinicaService = require('../services/clinicaService');
const { verificarPermiso } = require('../middlewares/checkPermiso');

// Gestión de usuarios — requiere permiso de página 'usuario'
router.get('/buscarUsuarios',
    autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave,
    verificarPermiso('usuario'),
    obtenerUsuarios
);

router.post('/crearUsuario',
    autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave,
    validarUsuarioCreacion,
    verificarPermiso('usuario'),
    crearUsuario
);

router.delete('/eliminarUsuario/:idusuario',
    autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave,
    verificarPermiso('usuario'),
    eliminarUsuario
);

// Endpoints de utilidad — accesibles a cualquier usuario autenticado
// (usados internamente por otros módulos: agenda, perfil, etc.)
router.get('/buscarPorId/:idusuario',
    autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave,
    obtenerUsuarioPorId
);

router.get('/buscarPorRol/:rol',
    autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave,
    obtenerUsuarioPorRol
);

router.get('/profesionalesAgenda',
    autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave,
    obtenerProfesionalesAgenda
);

router.put('/actualizarUsuario/:idusuario',
    autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave,
    validarUsuarioActualizar,
    actuarlizarUsuario
);

router.get('/roles',
    autenticacion.validarToken, autenticacion.verificarUsuarioEnBD,
    async (req, res) => {
        try { const roles = await RolService.consultarRol(); res.json(roles); }
        catch (error) { res.status(500).json({ error: error.message }); }
    }
);

router.get('/clinicas',
    autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave,
    async (req, res) => {
        try { const clinicas = await clinicaService.consultarClinica(); res.json(clinicas); }
        catch (error) { res.status(500).json({ error: error.message }); }
    }
);

module.exports = router;
