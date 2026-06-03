const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const { fileService } = require('../services/fileService');
const clinicaService = require('../services/clinicaService');
const {
  validarCrearDocumento, validarActualizarDocumento, validarIdDocumento,
  validarCambioEstado, validarParametrosBusqueda
} = require('../middlewares/validacionDocumentos');
const { verificarPermiso } = require('../middlewares/checkPermiso');

const uploadDocumento = fileService.createGenericMiddleware(['document'], 1);
const auth = [autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave];
const perm = verificarPermiso('documentos');

// Clínicas — utilidad para dropdowns
router.get('/clinicas/listar', ...auth, async (req, res) => {
    try {
        const resultado = await clinicaService.consultarClinica();
        resultado.success ? res.status(200).json(resultado) : res.status(400).json(resultado);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

router.get('/',        ...auth, validarParametrosBusqueda, perm, documentoController.listarDocumentos);
router.get('/:id',     ...auth, validarIdDocumento, perm, documentoController.obtenerDocumento);
router.post('/',       ...auth, uploadDocumento.single('documento'), validarCrearDocumento, perm, documentoController.crearDocumento);
router.put('/:id',     ...auth, validarIdDocumento, uploadDocumento.single('documento'), validarActualizarDocumento, perm, documentoController.actualizarDocumento);
router.delete('/:id',  ...auth, validarIdDocumento, perm, documentoController.eliminarDocumento);
router.patch('/:id/estado', ...auth, validarIdDocumento, validarCambioEstado, perm, documentoController.cambiarEstado);

module.exports = router;
