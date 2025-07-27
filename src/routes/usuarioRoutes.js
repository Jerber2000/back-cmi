const express = require('express');
const router = express.Router();
const { 
    obtenerUsuarios,
    obtenerUsuarioPorId,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario
 } = require('../controllers/usuarioController');
const autenticacion = require('../middlewares/auth');
const { validarUsuarioCreacion, validarUsuarioActualizar } = require('../middlewares/validacionMiddleware');

router.get(
    '/buscarUsuarios',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    obtenerUsuarios
);

router.get(
    '/buscarPorId/:idusuario',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    obtenerUsuarioPorId
);

router.post(
    '/crearUsuario',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarUsuarioCreacion,
    crearUsuario
);

router.put(
    '/actualizarUsuario/:idusuario',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    validarUsuarioActualizar,
    actualizarUsuario
);

router.put(
    '/eliminarUsuario/:idusuario',
    autenticacion.validarToken,
    autenticacion.verificarUsuarioEnBD,
    eliminarUsuario
);

module.exports = router;