const documentoService = require('../services/documentoService');
const { fileService } = require('../services/fileService');
const path = require('path');

class DocumentoController {

  async listarDocumentos(req, res) {
    try {
      const { estado, busqueda, fkclinica } = req.query;
      
      const resultado = await documentoService.listarDocumentos({ 
        estado, 
        busqueda,
        fkclinica 
      });

      if (resultado.success) {
        res.status(200).json({
          success: true,
          data: resultado.data,
          total: resultado.data.length
        });
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en DocumentoController.listarDocumentos:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async obtenerDocumento(req, res) {
    try {
      const { id } = req.params;
      
      const resultado = await documentoService.obtenerDocumento(id);

      if (resultado.success) {
        // Agregar URL pública si tiene archivo
        if (resultado.data.rutadocumento) {
          const fileName = path.basename(resultado.data.rutadocumento);
          resultado.data.urlPublica = `${process.env.API_URL}/api/files/${fileName}`;
        }

        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }
    } catch (error) {
      console.error('Error en DocumentoController.obtenerDocumento:', error.message);
      const statusCode = error.message === 'Documento no encontrado' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async crearDocumento(req, res) {
    try {
      const { nombredocumento, descripcion, fkclinica } = req.body;
      const archivo = req.file;
      const usuariocreacion = req.usuario.usuario || req.usuario.nombres;

      // Validar que venga el archivo
      if (!archivo) {
        return res.status(400).json({
          success: false,
          message: 'Debe adjuntar un archivo'
        });
      }

      // Crear documento en BD (sin ruta aún)
      const resultado = await documentoService.crearDocumento({
        nombredocumento,
        descripcion,
        fkclinica,
        usuariocreacion
      });

      // Si no se pudo crear el documento, retornar error
      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      // Subir archivo físico
      const rutasArchivos = await fileService.uploadFiles('documentos', {
        documento: archivo
      });

      // Actualizar ruta del documento en BD
      const documentoActualizado = await documentoService.actualizarRutaDocumento(
        resultado.data.iddocumento,
        rutasArchivos.documento,
        usuariocreacion
      );

      // Agregar URL pública
      const fileName = path.basename(documentoActualizado.rutadocumento);
      documentoActualizado.urlPublica = `${process.env.API_URL}/api/files/${fileName}`;

      res.status(201).json({
        success: true,
        message: 'Documento creado exitosamente',
        data: documentoActualizado
      });

    } catch (error) {
      console.error('Error en DocumentoController.crearDocumento:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async actualizarDocumento(req, res) {
    try {
      const { id } = req.params;
      const { nombredocumento, descripcion, fkclinica } = req.body;
      const archivoNuevo = req.file;
      const usuariomodificacion = req.usuario.usuario || req.usuario.nombres;

      // Actualizar datos básicos del documento
      const resultado = await documentoService.actualizarDocumento(id, {
        nombredocumento,
        descripcion,
        fkclinica,
        usuariomodificacion
      });

      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      // Si viene archivo nuevo, reemplazar el anterior
      if (archivoNuevo) {
        // Eliminar archivo anterior si existe
        if (resultado.data.rutadocumento) {
          try {
            await fileService.deleteFile(resultado.data.rutadocumento);
          } catch (error) {
            console.warn('No se pudo eliminar archivo anterior:', error.message);
          }
        }

        // Subir nuevo archivo
        const rutasArchivos = await fileService.uploadFiles('documentos', {
          documento: archivoNuevo
        });

        // Actualizar ruta en BD
        const documentoConNuevaRuta = await documentoService.actualizarRutaDocumento(
          id,
          rutasArchivos.documento,
          usuariomodificacion
        );

        // Agregar URL pública
        const fileName = path.basename(documentoConNuevaRuta.rutadocumento);
        documentoConNuevaRuta.urlPublica = `${process.env.API_URL}/api/files/${fileName}`;

        return res.status(200).json({
          success: true,
          message: 'Documento actualizado exitosamente',
          data: documentoConNuevaRuta
        });
      }

      // Si no hay archivo nuevo, solo agregar URL pública si existe archivo
      if (resultado.data.rutadocumento) {
        const fileName = path.basename(resultado.data.rutadocumento);
        resultado.data.urlPublica = `${process.env.API_URL}/api/files/${fileName}`;
      }

      res.status(200).json(resultado);

    } catch (error) {
      console.error('Error en DocumentoController.actualizarDocumento:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async eliminarDocumento(req, res) {
    try {
      const { id } = req.params;
      const usuariomodificacion = req.usuario.usuario || req.usuario.nombres;

      // Obtener documento para tener la ruta del archivo
      const documentoResult = await documentoService.obtenerDocumento(id);

      if (!documentoResult.success) {
        return res.status(404).json(documentoResult);
      }

      // Eliminar archivo físico si existe
      if (documentoResult.data.rutadocumento) {
        try {
          await fileService.deleteFile(documentoResult.data.rutadocumento);
        } catch (error) {
          console.warn('No se pudo eliminar archivo físico:', error.message);
        }
      }

      // Soft delete en BD
      const resultado = await documentoService.eliminarDocumento(id, usuariomodificacion);

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }

    } catch (error) {
      console.error('Error en DocumentoController.eliminarDocumento:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;
      const usuariomodificacion = req.usuario.usuario || req.usuario.nombres;

      const resultado = await documentoService.cambiarEstado(
        id,
        estado,
        usuariomodificacion
      );

      if (resultado.success) {
        res.status(200).json(resultado);
      } else {
        res.status(400).json(resultado);
      }

    } catch (error) {
      console.error('Error en DocumentoController.cambiarEstado:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new DocumentoController();