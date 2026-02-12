const historialService = require('../services/historialMedicoService');
const { fileService } = require('../services/fileService');
const { conAuditoria } = require('../utils/auditoria.helper');

class HistorialMedicoController {

  async obtenerHistorialPorPaciente(req, res) {
    try {
      const { idpaciente } = req.params;
      
      const resultado = await historialService.obtenerHistorialPorPaciente(idpaciente);

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Controller: Error al obtener historial:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener historial médico',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  async obtenerInfoPaciente(req, res) {
    try {
      const { idpaciente } = req.params;

      const resultado = await historialService.obtenerInfoPaciente(idpaciente);

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Controller: Error al obtener paciente:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener información del paciente',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  async crearSesion(req, res) {
    try {
      const datos = req.body;
      const usuarioCreador = req.usuario?.usuario || req.usuario?.nombres || 'Sistema';
      
      const fkclinicaUsuario = req.usuario?.fkclinica || null;

      const resultado = await conAuditoria(req, 'Hisorial Clinico', async (tx) => {
        return await historialService.crearSesion(
          { ...datos, fkclinicaUsuario },
          usuarioCreador,
          tx
        );
      });

      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      return res.status(201).json(resultado);

    } catch (error) {
      console.error('Controller: Error al crear sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear sesión de historial médico',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  async actualizarSesion(req, res) {
    try {
      const { idhistorial } = req.params;
      const datos = req.body;
      const usuarioModificador = req.usuario?.usuario || req.usuario?.nombres || 'Sistema';

      const resultado = await conAuditoria(req, 'Historial Clinico', async (tx) => {
        return await historialService.actualizarSesion(
          idhistorial,
          datos,
          usuarioModificador,
          tx
        );
      });

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Controller: Error al actualizar sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar sesión',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  async eliminarSesion(req, res) {
    try {
      const { idhistorial } = req.params;
      const usuarioModificador = req.usuario?.usuario || 'Sistema';

      const resultado = await conAuditoria(req, 'Historial Clinico', async (tx) => {
        return await historialService.eliminarSesion(
          idhistorial,
          usuarioModificador,
          tx
        );
      });

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Controller: Error al eliminar sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar sesión',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  async actualizarSesionConArchivos(req, res) {
    try {
      const { idhistorial } = req.params;
      const { rutaarchivos } = req.body;
      const usuarioModificador = req.usuario?.usuario || req.usuario?.nombres || 'Sistema';

      const resultado = await historialService.actualizarRutaArchivos(
        idhistorial, 
        rutaarchivos, 
        usuarioModificador
      );

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Controller: Error al actualizar archivos de sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar archivos',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  async obtenerArchivosSesion(req, res) {
    try {
      const { idhistorial } = req.params;

      const resultado = await historialService.obtenerArchivosSesion(idhistorial);

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      return res.status(200).json(resultado);

    } catch (error) {
      console.error('Controller: Error al obtener archivos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener archivos',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  async subirArchivos(req, res) {
    try {
      const { idpaciente } = req.params;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se enviaron archivos para subir'
        });
      }

      const pacienteExiste = await historialService.validarPacienteExiste(idpaciente);
      
      if (!pacienteExiste) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      const archivosSubidos = [];

      // Procesar cada archivo usando fileService
      for (const file of files) {
        try {
          // Determinar subcarpeta según tipo
          const esImagen = file.mimetype.startsWith('image/');
          const subcarpeta = esImagen ? 'historiales/fotos' : 'historiales/documentos';
          
          // Subir archivo usando el servicio genérico
          const resultado = await fileService.uploadFiles(subcarpeta, {
            [esImagen ? 'foto' : 'documento']: file
          });

          archivosSubidos.push({
            nombreOriginal: file.originalname,
            nombreArchivo: file.filename,
            rutaServicio: esImagen ? resultado.foto : resultado.documento,
            rutaCompleta: file.path,
            url: `/api/files/${file.filename}`,
            tamaño: file.size,
            tipo: file.mimetype,
            categoria: esImagen ? 'imagen' : 'documento'
          });

        } catch (error) {
          console.error(`Error subiendo archivo ${file.originalname}:`, error);
          // Continuar con otros archivos
        }
      }

      return res.status(201).json({
        success: true,
        message: `${archivosSubidos.length} archivo(s) subido(s) correctamente`,
        data: {
          pacienteId: parseInt(idpaciente),
          archivos: archivosSubidos,
          total: archivosSubidos.length,
          errores: files.length - archivosSubidos.length
        }
      });

    } catch (error) {
      console.error('Controller: Error al subir archivos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al subir archivos',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
}

module.exports = new HistorialMedicoController();