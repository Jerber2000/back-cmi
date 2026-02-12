const { fileService } = require('../services/fileService');

class ArchivoController {

  async subirFoto(req, res) {
    try {
      const { entidad } = req.params;
      const { entityId, rutaAnterior } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No se encontró archivo de foto'
        });
      }

      // Eliminar archivo anterior si viene
      if (rutaAnterior && rutaAnterior.trim() !== '') {
        await fileService.deleteFile(rutaAnterior).catch(err => {
        });
      }

      // Subir nuevo archivo
      const filePath = await fileService.uploadFiles(`${entidad}/fotos`, { foto: file });

      res.json({
        success: true,
        message: 'Foto subida correctamente',
        data: {
          rutaArchivo: filePath.foto
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir foto'
      });
    }
  }
  
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

      // Eliminar documento anterior si viene
      if (rutaAnterior && rutaAnterior.trim() !== '') {
        await fileService.deleteFile(rutaAnterior).catch(err => {
        });
      }

      // Subir nuevo documento
      const filePath = await fileService.uploadFiles(`${entidad}/documentos`, { documento: file });

      res.json({
        success: true,
        message: 'Documento subido correctamente',
        data: {
          rutaArchivo: filePath.documento
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir documento'
      });
    }
  }
  
  async subirArchivos(req, res) {
    try {
      const { entidad } = req.params;
      const { entityId, rutaFotoAnterior, rutaDocumentoAnterior } = req.body;
      const files = req.files;

      const archivosSubidos = {};

      if (files.foto && files.foto[0]) {
        // Eliminar foto anterior si viene
        if (rutaFotoAnterior && rutaFotoAnterior.trim() !== '') {
          await fileService.deleteFile(rutaFotoAnterior).catch(err => {
          });
        }

        // Subir nueva foto
        const fotoPath = await fileService.uploadFiles(`${entidad}/fotos`, { foto: files.foto[0] });
        archivosSubidos.rutaFoto = fotoPath.foto;
      }

      // DOCUMENTO
      if (files.documento && files.documento[0]) {
        // Eliminar documento anterior si viene
        if (rutaDocumentoAnterior && rutaDocumentoAnterior.trim() !== '') {
          await fileService.deleteFile(rutaDocumentoAnterior).catch(err => {
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
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir archivos'
      });
    }
  }

  /**
   * Elimina archivo
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
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar archivo'
      });
    }
  }
}

module.exports = { ArchivoController };