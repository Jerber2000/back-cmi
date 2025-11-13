// src/routes/documentoRoutes.js

const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const { fileService } = require('../services/fileService');
const clinicaService = require('../services/clinicaService'); // ← AGREGAR ESTA LÍNEA
const {
  validarCrearDocumento,
  validarActualizarDocumento,
  validarIdDocumento,
  validarCambioEstado,
  validarParametrosBusqueda
} = require('../middlewares/validacionDocumentos');

const uploadDocumento = fileService.createGenericMiddleware(['document'], 1);

router.get(
  '/',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  validarParametrosBusqueda,
  documentoController.listarDocumentos
);

router.get(
  '/:id',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  validarIdDocumento,
  documentoController.obtenerDocumento
);

router.post(
  '/',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  uploadDocumento.single('documento'),
  validarCrearDocumento,
  documentoController.crearDocumento
);

router.put(
  '/:id',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  validarIdDocumento,
  uploadDocumento.single('documento'),
  validarActualizarDocumento,
  documentoController.actualizarDocumento
);

router.delete(
  '/:id',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  validarIdDocumento,
  documentoController.eliminarDocumento
);

router.patch(
  '/:id/estado',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  validarIdDocumento,
  validarCambioEstado,
  documentoController.cambiarEstado
);

// ← AGREGAR ESTE ENDPOINT DE CLÍNICAS
router.get(
  '/clinicas/listar',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  async (req, res) => {
    try {
      const resultado = await clinicaService.consultarClinica();
      
      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error al consultar clínicas:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

module.exports = router;