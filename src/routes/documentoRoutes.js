const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const { validarToken, verificarUsuarioEnBD } = require('../middlewares/auth');
const { fileService } = require('../services/fileService');
const {
  validarCrearDocumento,
  validarActualizarDocumento,
  validarIdDocumento,
  validarCambioEstado,
  validarParametrosBusqueda
} = require('../middlewares/validacionDocumentos');

router.use(validarToken);
router.use(verificarUsuarioEnBD);

const uploadDocumento = fileService.createGenericMiddleware(['document'], 1);

router.get('/', validarParametrosBusqueda, documentoController.listarDocumentos);
router.get('/:id', validarIdDocumento, documentoController.obtenerDocumento);
router.post('/', uploadDocumento.single('documento'), validarCrearDocumento, documentoController.crearDocumento);
router.put('/:id', validarIdDocumento, uploadDocumento.single('documento'), validarActualizarDocumento, documentoController.actualizarDocumento);
router.delete('/:id', validarIdDocumento, documentoController.eliminarDocumento);
router.patch('/:id/estado', validarIdDocumento, validarCambioEstado, documentoController.cambiarEstado);

module.exports = router;