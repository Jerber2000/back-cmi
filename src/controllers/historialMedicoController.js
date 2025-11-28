// controllers/historialMedicoController.js
const historialService = require('../services/historialMedicoService');
const { fileService } = require('../services/fileService');

class HistorialMedicoController {

  /**
   * Obtiene historial de un paciente
   */
  async obtenerHistorialPorPaciente(req, res) {
    try {
      const { idpaciente } = req.params;
      console.log('🔍 Controller: Obteniendo historial para paciente ID:', idpaciente);
      
      const resultado = await historialService.obtenerHistorialPorPaciente(idpaciente);

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      console.log(`✅ Controller: ${resultado.total} registros encontrados`);
      return res.status(200).json(resultado);

    } catch (error) {
      console.error('❌ Controller: Error al obtener historial:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener historial médico',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Obtiene info básica del paciente
   */
  async obtenerInfoPaciente(req, res) {
    try {
      const { idpaciente } = req.params;
      console.log('🔍 Controller: Obteniendo info del paciente ID:', idpaciente);

      const resultado = await historialService.obtenerInfoPaciente(idpaciente);

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      console.log('✅ Controller: Paciente encontrado');
      return res.status(200).json(resultado);

    } catch (error) {
      console.error('❌ Controller: Error al obtener paciente:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener información del paciente',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Crea nueva sesión
   */
  async crearSesion(req, res) {
    try {
      const datos = req.body;
      const usuarioCreador = req.usuario?.usuario || req.usuario?.nombres || 'Sistema';
      
      // ✅ Obtener fkclinica del usuario autenticado
      const fkclinicaUsuario = req.usuario?.fkclinica || null;

      console.log('🆕 Controller: Creando nueva sesión para paciente:', datos.fkpaciente);
      console.log('🏥 Controller: fkclinica del usuario autenticado:', fkclinicaUsuario);

      // ✅ Pasar fkclinica del usuario al service
      const resultado = await historialService.crearSesion(
        { ...datos, fkclinicaUsuario }, 
        usuarioCreador
      );

      if (!resultado.success) {
        return res.status(400).json(resultado);
      }

      console.log('✅ Controller: Sesión creada con ID:', resultado.data.idhistorial);
      return res.status(201).json(resultado);

    } catch (error) {
      console.error('❌ Controller: Error al crear sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear sesión de historial médico',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Actualiza sesión existente
   */
  async actualizarSesion(req, res) {
    try {
      const { idhistorial } = req.params;
      const datos = req.body;
      const usuarioModificador = req.usuario?.usuario || req.usuario?.nombres || 'Sistema';

      console.log('🔄 Controller: Actualizando sesión ID:', idhistorial);

      const resultado = await historialService.actualizarSesion(
        idhistorial, 
        datos, 
        usuarioModificador
      );

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      console.log('✅ Controller: Sesión actualizada correctamente');
      return res.status(200).json(resultado);

    } catch (error) {
      console.error('❌ Controller: Error al actualizar sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar sesión',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Elimina sesión
   */
  async eliminarSesion(req, res) {
    try {
      const { idhistorial } = req.params;
      const usuarioModificador = req.usuario?.usuario || 'Sistema';

      console.log('🗑️ Controller: Eliminando sesión ID:', idhistorial);

      const resultado = await historialService.eliminarSesion(idhistorial, usuarioModificador);

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      console.log('✅ Controller: Sesión eliminada correctamente');
      return res.status(200).json(resultado);

    } catch (error) {
      console.error('❌ Controller: Error al eliminar sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar sesión',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Actualiza ruta de archivos de una sesión
   */
  async actualizarSesionConArchivos(req, res) {
    try {
      const { idhistorial } = req.params;
      const { rutaarchivos } = req.body;
      const usuarioModificador = req.usuario?.usuario || req.usuario?.nombres || 'Sistema';

      console.log('🔄 Controller: Actualizando archivos para sesión ID:', idhistorial);

      const resultado = await historialService.actualizarRutaArchivos(
        idhistorial, 
        rutaarchivos, 
        usuarioModificador
      );

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      console.log('✅ Controller: Archivos actualizados correctamente');
      return res.status(200).json(resultado);

    } catch (error) {
      console.error('❌ Controller: Error al actualizar archivos de sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar archivos',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Obtiene archivos de una sesión específica
   */
  async obtenerArchivosSesion(req, res) {
    try {
      const { idhistorial } = req.params;
      console.log('📎 Controller: Obteniendo archivos para sesión ID:', idhistorial);

      const resultado = await historialService.obtenerArchivosSesion(idhistorial);

      if (!resultado.success) {
        return res.status(404).json(resultado);
      }

      console.log(`✅ Controller: ${resultado.total} archivos encontrados`);
      return res.status(200).json(resultado);

    } catch (error) {
      console.error('❌ Controller: Error al obtener archivos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener archivos',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  /**
   * Sube archivos para historial médico
   */
  async subirArchivos(req, res) {
    try {
      const { idpaciente } = req.params;
      const files = req.files;

      console.log('📎 Controller: Subiendo archivos para paciente:', idpaciente);

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se enviaron archivos para subir'
        });
      }

      // Verificar que el paciente existe usando el service
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

      console.log(`✅ Controller: ${archivosSubidos.length} de ${files.length} archivos subidos`);

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
      console.error('❌ Controller: Error al subir archivos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al subir archivos',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
}

module.exports = new HistorialMedicoController();