//routes/archivoRoutes.js
const express = require('express');
const { ArchivoController } = require('../controllers/archivoController');
const { fileService } = require('../services/fileService');

const router = express.Router();
const archivoController = new ArchivoController();

// Middleware simple para archivos
const uploadFoto = fileService.createGenericMiddleware(['image'], 1);
const uploadDocumento = fileService.createGenericMiddleware(['document'], 1);
const uploadAmbos = fileService.createGenericMiddleware(['image', 'document'], 2);

// ========================================
// RUTAS GENÉRICAS (RECOMENDADAS)
// ========================================

// Subir foto para cualquier entidad
// POST /api/archivo/:entidad/subirFoto
// Ejemplos: /usuarios/subirFoto, /pacientes/subirFoto, /productos/subirFoto
router.post('/:entidad/subirFoto', uploadFoto.single('foto'), (req, res) => {
  archivoController.subirFoto(req, res);
});

// Subir documento para cualquier entidad
// POST /api/archivo/:entidad/subirDocumento
router.post('/:entidad/subirDocumento', uploadDocumento.single('documento'), (req, res) => {
  archivoController.subirDocumento(req, res);
});

// Subir ambos archivos para cualquier entidad
// POST /api/archivo/:entidad/subirArchivos
router.post('/:entidad/subirArchivos', uploadAmbos.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'documento', maxCount: 1 }
]), (req, res) => {
  archivoController.subirArchivos(req, res);
});

// ========================================
// RUTAS COMUNES
// ========================================

// Eliminar archivo (ya es genérico)
router.delete('/eliminar', (req, res) => {
  archivoController.eliminarArchivo(req, res);
});

module.exports = router;