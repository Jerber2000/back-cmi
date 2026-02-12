const express = require('express');
const { ArchivoController } = require('../controllers/archivoController');
const { fileService } = require('../services/fileService');

const router = express.Router();
const archivoController = new ArchivoController();

const uploadFoto = fileService.createGenericMiddleware(['image'], 1);
const uploadDocumento = fileService.createGenericMiddleware(['document'], 1);
const uploadAmbos = fileService.createGenericMiddleware(['image', 'document'], 2);

router.post('/:entidad/subirFoto', uploadFoto.single('foto'), (req, res) => {
  archivoController.subirFoto(req, res);
});

router.post('/:entidad/subirDocumento', uploadDocumento.single('documento'), (req, res) => {
  archivoController.subirDocumento(req, res);
});

router.post('/:entidad/subirArchivos', uploadAmbos.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'documento', maxCount: 1 }
]), (req, res) => {
  archivoController.subirArchivos(req, res);
});

router.delete('/eliminar', (req, res) => {
  archivoController.eliminarArchivo(req, res);
});

module.exports = router;