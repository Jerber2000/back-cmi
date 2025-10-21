const express = require('express');
const router = express.Router();
const { 
    obtenerUsuarios,
    obtenerUsuarioPorId,
    obtenerUsuarioPorRol,
    crearUsuario,
    actuarlizarUsuario,
    eliminarUsuario
 } = require('../controllers/usuarioController');
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const { validarUsuarioCreacion, validarUsuarioActualizar } = require('../middlewares/validacionMiddleware');
const RolService = require('../services/rolService');
const authService = require('../services/authService');
const clinicaService = require('../services/clinicaService');
const checkRole = require('../middlewares/checkRole');

router.get(
    '/buscarUsuarios',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    checkRole(1,5),
    obtenerUsuarios
);

router.get(
    '/buscarPorId/:idusuario',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    checkRole(1,2,3,4,5,6,7),
    obtenerUsuarioPorId
);

router.get(
    '/buscarPorRol/:rol',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    obtenerUsuarioPorRol
);

router.post(
    '/crearUsuario',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    validarUsuarioCreacion,
    checkRole(1,5),
    crearUsuario
);

router.put(
    '/actualizarUsuario/:idusuario',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    validarUsuarioActualizar,
    checkRole(1,2,3,4,5,6,7),
    actuarlizarUsuario
);

router.delete(
    '/eliminarUsuario/:idusuario',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    checkRole(1,5),
    eliminarUsuario
);

router.get('/roles',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    checkRole(1,5),
    async (req, res) => {
        try{
            const roles = await RolService.consultarRol();
            res.json(roles);
        }catch(error){
            res.status(500).json({ error: error.message });
        }
    }
);

router.get(
    '/clinicas',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarCambioClave,
    checkRole(1,5),
    async (req, res) => {
        try{
            const clinicas = await clinicaService.consultarClinica();
            res.json(clinicas);
        }catch(error){
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router;