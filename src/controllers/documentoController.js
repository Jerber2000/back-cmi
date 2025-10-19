const documentoService = require('../services/documentoService');
const { fileService } = require('../services/fileService');
const path = require('path');

class DocumentoController {

  async listarDocumentos(req, res) {
    try {
      const { estado, busqueda } = req.query;
      
      const documentos = await documentoService.listarDocumentos({ 
        estado, 
        busqueda 
      });

      res.json({
        success: true,
        data: documentos,
        total: documentos.length
      });
    } catch (error) {
      console.error('Error en DocumentoController.listarDocumentos:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al listar documentos'
      });
    }
  }

  async obtenerDocumento(req, res) {
    try {
      const { id } = req.params;
      
      const documento = await documentoService.obtenerDocumento(id);

      if (documento.rutadocumento) {
        const fileName = path.basename(documento.rutadocumento);
        documento.urlPublica = `${process.env.API_URL || 'http://localhost:3000'}/api/files/${fileName}`;
      }

      res.json({
        success: true,
        data: documento
      });
    } catch (error) {
      console.error('Error en DocumentoController.obtenerDocumento:', error);
      const statusCode = error.message === 'Documento no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async crearDocumento(req, res) {
    try {
      const { nombredocumento, descripcion } = req.body;
      const archivo = req.file;
      const usuariocreacion = req.usuario.usuario || req.usuario.nombres;

      const nuevoDocumento = await documentoService.crearDocumento({
        nombredocumento,
        descripcion,
        usuariocreacion
      });

      const rutasArchivos = await fileService.uploadFiles('documentos', {
        documento: archivo
      });

      const documentoActualizado = await documentoService.actualizarRutaDocumento(
        nuevoDocumento.iddocumento,
        rutasArchivos.documento,
        usuariocreacion
      );

      const fileName = path.basename(documentoActualizado.rutadocumento);
      documentoActualizado.urlPublica = `${process.env.API_URL || 'http://localhost:3000'}/api/files/${fileName}`;

      res.status(201).json({
        success: true,
        message: 'Documento creado exitosamente',
        data: documentoActualizado
      });

    } catch (error) {
      console.error('Error en DocumentoController.crearDocumento:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear documento'
      });
    }
  }

  async actualizarDocumento(req, res) {
    try {
      const { id } = req.params;
      const { nombredocumento, descripcion } = req.body;
      const archivoNuevo = req.file;
      const usuariomodificacion = req.usuario.usuario || req.usuario.nombres;

      const documentoActualizado = await documentoService.actualizarDocumento(id, {
        nombredocumento,
        descripcion,
        usuariomodificacion
      });

      if (archivoNuevo) {
        if (documentoActualizado.rutadocumento) {
          try {
            await fileService.deleteFile(documentoActualizado.rutadocumento);
          } catch (error) {
            console.warn('No se pudo eliminar archivo anterior:', error.message);
          }
        }

        const rutasArchivos = await fileService.uploadFiles('documentos', {
          documento: archivoNuevo
        });

        const documentoConNuevaRuta = await documentoService.actualizarRutaDocumento(
          id,
          rutasArchivos.documento,
          usuariomodificacion
        );

        const fileName = path.basename(documentoConNuevaRuta.rutadocumento);
        documentoConNuevaRuta.urlPublica = `${process.env.API_URL || 'http://localhost:3000'}/api/files/${fileName}`;

        return res.json({
          success: true,
          message: 'Documento actualizado exitosamente',
          data: documentoConNuevaRuta
        });
      }

      if (documentoActualizado.rutadocumento) {
        const fileName = path.basename(documentoActualizado.rutadocumento);
        documentoActualizado.urlPublica = `${process.env.API_URL || 'http://localhost:3000'}/api/files/${fileName}`;
      }

      res.json({
        success: true,
        message: 'Documento actualizado exitosamente',
        data: documentoActualizado
      });

    } catch (error) {
      console.error('Error en DocumentoController.actualizarDocumento:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar documento'
      });
    }
  }

  async eliminarDocumento(req, res) {
    try {
      const { id } = req.params;
      const usuariomodificacion = req.usuario.usuario || req.usuario.nombres;

      const documento = await documentoService.obtenerDocumento(id);

      if (documento.rutadocumento) {
        try {
          await fileService.deleteFile(documento.rutadocumento);
        } catch (error) {
          console.warn('No se pudo eliminar archivo físico:', error.message);
        }
      }

      await documentoService.eliminarDocumento(id, usuariomodificacion);

      res.json({
        success: true,
        message: 'Documento eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error en DocumentoController.eliminarDocumento:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar documento'
      });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const usuariomodificacion = req.usuario.usuario || req.usuario.nombres;

      const documentoActualizado = await documentoService.cambiarEstado(
        id,
        estado,
        usuariomodificacion
      );

      res.json({
        success: true,
        message: 'Estado actualizado exitosamente',
        data: documentoActualizado
      });

    } catch (error) {
      console.error('Error en DocumentoController.cambiarEstado:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al cambiar estado'
      });
    }
  }
}

module.exports = new DocumentoController();