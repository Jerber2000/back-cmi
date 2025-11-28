//controllers/archivoController.js
const { fileService } = require('../services/fileService');

class ArchivoController {

  /**
   * ✅ Sube foto genérica - ELIMINA ANTERIOR SI VIENE
   * POST /api/archivo/:entidad/subirFoto
   * Body: { entityId, rutaAnterior? }
   */
  async subirFoto(req, res) {
    try {
      const { entidad } = req.params;
      const { entityId, rutaAnterior } = req.body; // ✅ Recibir ruta anterior
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se encontró archivo de foto'
        });
      }

      // ✅ PASO 1: Eliminar archivo anterior si viene
      if (rutaAnterior && rutaAnterior.trim() !== '') {
        console.log('🗑️ Eliminando archivo anterior:', rutaAnterior);
        await fileService.deleteFile(rutaAnterior).catch(err => {
          console.warn('⚠️ No se pudo eliminar archivo anterior:', err);
          // No bloquear si falla
        });
      }

      // ✅ PASO 2: Subir nuevo archivo
      const filePath = await fileService.uploadFiles(`${entidad}/fotos`, { foto: file });

      res.json({
        success: true,
        message: 'Foto subida correctamente',
        data: {
          rutaArchivo: filePath.foto
        }
      });

    } catch (error) {
      console.error('Error en subirFoto:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir foto'
      });
    }
  }

  /**
   * ✅ Sube documento genérico - ELIMINA ANTERIOR SI VIENE
   * POST /api/archivo/:entidad/subirDocumento
   * Body: { entityId, rutaAnterior? }
   */
  async subirDocumento(req, res) {
    try {
      const { entidad } = req.params;
      const { entityId, rutaAnterior } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se encontró archivo de documento'
        });
      }

      // ✅ PASO 1: Eliminar documento anterior si viene
      if (rutaAnterior && rutaAnterior.trim() !== '') {
        console.log('🗑️ Eliminando documento anterior:', rutaAnterior);
        await fileService.deleteFile(rutaAnterior).catch(err => {
          console.warn('⚠️ No se pudo eliminar documento anterior:', err);
        });
      }

      // ✅ PASO 2: Subir nuevo documento
      const filePath = await fileService.uploadFiles(`${entidad}/documentos`, { documento: file });

      res.json({
        success: true,
        message: 'Documento subido correctamente',
        data: {
          rutaArchivo: filePath.documento
        }
      });

    } catch (error) {
      console.error('Error en subirDocumento:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir documento'
      });
    }
  }

  /**
   * ✅ Sube ambos archivos - ELIMINA ANTERIORES SI VIENEN
   * POST /api/archivo/:entidad/subirArchivos
   * Body: { entityId, rutaFotoAnterior?, rutaDocumentoAnterior? }
   */
  async subirArchivos(req, res) {
    try {
      const { entidad } = req.params;
      const { entityId, rutaFotoAnterior, rutaDocumentoAnterior } = req.body;
      const files = req.files;

      const archivosSubidos = {};

      // ✅ FOTO
      if (files.foto && files.foto[0]) {
        // Eliminar foto anterior si viene
        if (rutaFotoAnterior && rutaFotoAnterior.trim() !== '') {
          console.log('🗑️ Eliminando foto anterior:', rutaFotoAnterior);
          await fileService.deleteFile(rutaFotoAnterior).catch(err => {
            console.warn('⚠️ No se pudo eliminar foto anterior:', err);
          });
        }

        // Subir nueva foto
        const fotoPath = await fileService.uploadFiles(`${entidad}/fotos`, { foto: files.foto[0] });
        archivosSubidos.rutaFoto = fotoPath.foto;
      }

      // ✅ DOCUMENTO
      if (files.documento && files.documento[0]) {
        // Eliminar documento anterior si viene
        if (rutaDocumentoAnterior && rutaDocumentoAnterior.trim() !== '') {
          console.log('🗑️ Eliminando documento anterior:', rutaDocumentoAnterior);
          await fileService.deleteFile(rutaDocumentoAnterior).catch(err => {
            console.warn('⚠️ No se pudo eliminar documento anterior:', err);
          });
        }

        // Subir nuevo documento
        const docPath = await fileService.uploadFiles(`${entidad}/documentos`, { documento: files.documento[0] });
        archivosSubidos.rutaDocumento = docPath.documento;
      }

      res.json({
        success: true,
        message: 'Archivos subidos correctamente',
        data: archivosSubidos
      });

    } catch (error) {
      console.error('Error en subirArchivos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir archivos'
      });
    }
  }

  /**
   * ✅ Elimina archivo
   * DELETE /api/archivo/eliminar
   * Body: { rutaArchivo }
   */
  async eliminarArchivo(req, res) {
    try {
      const { rutaArchivo } = req.body;

      if (!rutaArchivo) {
        return res.status(400).json({
          success: false,
          message: 'Ruta de archivo no especificada'
        });
      }

      // Validación de seguridad
      if (rutaArchivo.includes('..') || rutaArchivo.includes('~')) {
        return res.status(400).json({
          success: false,
          message: 'Ruta de archivo inválida'
        });
      }

      const eliminado = await fileService.deleteFile(rutaArchivo);

      if (!eliminado) {
        return res.status(404).json({
          success: false,
          message: 'No se pudo eliminar el archivo o no existe'
        });
      }

      res.json({
        success: true,
        message: 'Archivo eliminado correctamente'
      });

    } catch (error) {
      console.error('Error en eliminarArchivo:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar archivo'
      });
    }
  }
}

module.exports = { ArchivoController };