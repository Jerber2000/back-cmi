// controllers/historialMedicoController.js - VERSIÓN COMPLETA CON MEJORAS
const { PrismaClient } = require('../generated/prisma');
const { fileService } = require('../services/fileService');
const prisma = new PrismaClient();

class HistorialMedicoController {

  // Obtener historial de un paciente
  async obtenerHistorialPorPaciente(req, res) {
    try {
      const { idpaciente } = req.params;
      console.log('🔍 Obteniendo historial para paciente ID:', idpaciente);
      
      // ✅ VALIDAR QUE EL PACIENTE EXISTA PRIMERO
      const pacienteExiste = await prisma.paciente.findUnique({
        where: { idpaciente: parseInt(idpaciente) }
      });

      if (!pacienteExiste) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }
      
      const historial = await prisma.detallehistorialclinico.findMany({
        where: { 
          fkpaciente: parseInt(idpaciente),
          estado: 1
        },
        include: {
          usuario: {
            select: {
              nombres: true,
              apellidos: true,
              puesto: true
            }
          },
          paciente: {
            select: {
              nombres: true,
              apellidos: true,
              expedientes: {
                select: {
                  numeroexpediente: true
                }
              }
            }
          }
        },
        orderBy: { fechacreacion: 'desc' }
      });
      
      console.log('✅ Registros encontrados:', historial.length);

      return res.status(200).json({
        success: true,
        message: 'Historial obtenido correctamente',
        data: historial,
        total: historial.length
      });

    } catch (error) {
      console.error('❌ Error al obtener historial:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener historial médico',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  // Obtener info básica del paciente
  async obtenerInfoPaciente(req, res) {
    try {
      const { idpaciente } = req.params;
      console.log('🔍 Obteniendo info del paciente ID:', idpaciente);

      const paciente = await prisma.paciente.findUnique({
        where: { idpaciente: parseInt(idpaciente) },
        select: {
          idpaciente: true,
          nombres: true,
          apellidos: true,
          cui: true,
          rutafotoperfil: true,
          telefono: true,
          email: true,
          fechanacimiento: true,
          expedientes: {
            select: {
              numeroexpediente: true,
              fechacreacion: true
            }
          }
        }
      });

      if (!paciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      console.log('✅ Paciente encontrado:', paciente.nombres, paciente.apellidos);

      return res.status(200).json({
        success: true,
        message: 'Información del paciente obtenida correctamente',
        data: paciente
      });

    } catch (error) {
      console.error('❌ Error al obtener paciente:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener información del paciente',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  // Crear nueva sesión
  async crearSesion(req, res) {
    try {
      const { 
        fkpaciente, 
        fkusuario, 
        fecha,
        recordatorio,
        notaconsulta,
        motivoconsulta,
        evolucion,
        diagnosticotratamiento
      } = req.body;

      console.log('🆕 Creando nueva sesión para paciente:', fkpaciente);

      // ✅ VALIDAR QUE EL PACIENTE Y USUARIO EXISTAN
      const [pacienteExiste, usuarioExiste] = await Promise.all([
        prisma.paciente.findUnique({ where: { idpaciente: parseInt(fkpaciente) }}),
        prisma.usuario.findUnique({ where: { idusuario: parseInt(fkusuario) }})
      ]);

      if (!pacienteExiste) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      if (!usuarioExiste) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const usuariocreacion = req.usuario?.usuario || req.usuario?.nombres || 'Sistema';

      const nuevaSesion = await prisma.detallehistorialclinico.create({
        data: {
          fkpaciente: parseInt(fkpaciente),
          fkusuario: parseInt(fkusuario),
          fecha: new Date(fecha),
          recordatorio: recordatorio || null,
          notaconsulta: notaconsulta || null,
          motivoconsulta,
          evolucion: evolucion || null,
          diagnosticotratamiento: diagnosticotratamiento || null,
          rutahistorialclinico: null,
          usuariocreacion,
          fechacreacion: new Date(),
          estado: 1
        },
        include: {
          usuario: {
            select: {
              nombres: true,
              apellidos: true,
              puesto: true
            }
          },
          paciente: {
            select: {
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      console.log('✅ Sesión creada con ID:', nuevaSesion.idhistorial);

      return res.status(201).json({
        success: true,
        message: 'Sesión de historial creada correctamente',
        data: nuevaSesion
      });

    } catch (error) {
      console.error('❌ Error al crear sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al crear sesión de historial médico',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  // Actualizar sesión
  async actualizarSesion(req, res) {
    try {
      const { idhistorial } = req.params;
      const { 
        recordatorio,
        notaconsulta,
        motivoconsulta,
        evolucion,
        diagnosticotratamiento
      } = req.body;

      console.log('🔄 Actualizando sesión ID:', idhistorial);

      // ✅ VERIFICAR QUE LA SESIÓN EXISTA
      const sesionExiste = await prisma.detallehistorialclinico.findUnique({
        where: { idhistorial: parseInt(idhistorial) }
      });

      if (!sesionExiste) {
        return res.status(404).json({
          success: false,
          message: 'Sesión de historial no encontrada'
        });
      }

      const usuariomodificacion = req.usuario?.usuario || req.usuario?.nombres || 'Sistema';

      const sesionActualizada = await prisma.detallehistorialclinico.update({
        where: { idhistorial: parseInt(idhistorial) },
        data: {
          recordatorio,
          notaconsulta,
          motivoconsulta,
          evolucion,
          diagnosticotratamiento,
          usuariomodificacion,
          fechamodificacion: new Date()
        },
        include: {
          usuario: {
            select: {
              nombres: true,
              apellidos: true,
              puesto: true
            }
          },
          paciente: {
            select: {
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      console.log('✅ Sesión actualizada correctamente');

      return res.status(200).json({
        success: true,
        message: 'Sesión actualizada correctamente',
        data: sesionActualizada
      });

    } catch (error) {
      console.error('❌ Error al actualizar sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar sesión',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  // ✅ NUEVO: Eliminar sesión
  async eliminarSesion(req, res) {
    try {
      const { idhistorial } = req.params;
      console.log('🗑️ Eliminando sesión ID:', idhistorial);

      // Verificar que la sesión existe
      const sesionExiste = await prisma.detallehistorialclinico.findUnique({
        where: { idhistorial: parseInt(idhistorial) }
      });

      if (!sesionExiste) {
        return res.status(404).json({
          success: false,
          message: 'Sesión no encontrada'
        });
      }

      // Eliminar físicamente o marcar como eliminado
      await prisma.detallehistorialclinico.update({
        where: { idhistorial: parseInt(idhistorial) },
        data: {
          estado: 0, // Marcar como eliminado en lugar de borrar físicamente
          usuariomodificacion: req.usuario?.usuario || 'Sistema',
          fechamodificacion: new Date()
        }
      });

      console.log('✅ Sesión eliminada correctamente');

      return res.status(200).json({
        success: true,
        message: 'Sesión eliminada correctamente'
      });

    } catch (error) {
      console.error('❌ Error al eliminar sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar sesión',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  // Actualizar sesión con archivos
  async actualizarSesionConArchivos(req, res) {
    try {
      const { idhistorial } = req.params;
      const { rutaarchivos } = req.body;

      console.log('🔄 Actualizando archivos para sesión ID:', idhistorial);

      const sesionExiste = await prisma.detallehistorialclinico.findUnique({
        where: { idhistorial: parseInt(idhistorial) }
      });

      if (!sesionExiste) {
        return res.status(404).json({
          success: false,
          message: 'Sesión no encontrada'
        });
      }

      const usuariomodificacion = req.usuario?.usuario || req.usuario?.nombres || 'Sistema';

      const sesionActualizada = await prisma.detallehistorialclinico.update({
        where: { idhistorial: parseInt(idhistorial) },
        data: {
          rutahistorialclinico: rutaarchivos,
          usuariomodificacion,
          fechamodificacion: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Archivos de sesión actualizados correctamente',
        data: sesionActualizada
      });

    } catch (error) {
      console.error('❌ Error al actualizar archivos de sesión:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al actualizar archivos',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }

  // Obtener archivos de una sesión específica
async obtenerArchivosSesion(req, res) {
  try {
    const { idhistorial } = req.params;
    console.log('📎 Obteniendo archivos para sesión ID:', idhistorial);

    const sesion = await prisma.detallehistorialclinico.findUnique({
      where: { idhistorial: parseInt(idhistorial) },
      select: {
        rutahistorialclinico: true
      }
    });

    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    let archivos = [];
    
    if (sesion.rutahistorialclinico) {
      try {
        // Si las rutas están como string separado por comas
        if (typeof sesion.rutahistorialclinico === 'string') {
          const rutas = sesion.rutahistorialclinico.split(',').filter(r => r.trim());
          
          archivos = rutas.map(ruta => {
            const rutaLimpia = ruta.trim();
            const nombreArchivo = rutaLimpia.split('/').pop();
            const esImagen = /\.(jpg|jpeg|png|gif|webp)$/i.test(nombreArchivo);
            
            return {
              id: Date.now() + Math.random(), // ID único temporal
              nombre: nombreArchivo,
              nombreOriginal: nombreArchivo,
              ruta: rutaLimpia,
              rutaServicio: rutaLimpia,
              url: `/api/files/${nombreArchivo}`, // URL para descargar
              tipo: esImagen ? 'imagen' : 'documento',
              categoria: esImagen ? 'imagen' : 'documento'
            };
          });
        } else {
          // Si ya está como JSON
          archivos = JSON.parse(sesion.rutahistorialclinico);
        }
        
      } catch (parseError) {
        console.error('Error parseando rutas de archivos:', parseError);
        // Si falla el parsing, intentar como string simple
        archivos = [{
          id: Date.now(),
          nombre: sesion.rutahistorialclinico.split('/').pop(),
          ruta: sesion.rutahistorialclinico,
          rutaServicio: sesion.rutahistorialclinico,
          url: `/api/files/${sesion.rutahistorialclinico.split('/').pop()}`
        }];
      }
    }

    console.log(`✅ ${archivos.length} archivos encontrados para la sesión`);

    return res.status(200).json({
      success: true,
      message: 'Archivos obtenidos correctamente',
      data: archivos,
      total: archivos.length
    });

  } catch (error) {
    console.error('❌ Error al obtener archivos:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener archivos',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}

  // ✅ MEJORADO: Subir archivos para historial médico usando fileService
  async subirArchivos(req, res) {
    try {
      const { idpaciente } = req.params;
      const files = req.files;

      console.log('📎 Subiendo archivos para paciente:', idpaciente);

      if (!files || files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se enviaron archivos para subir'
        });
      }

      // ✅ VERIFICAR QUE EL PACIENTE EXISTA
      const pacienteExiste = await prisma.paciente.findUnique({
        where: { idpaciente: parseInt(idpaciente) }
      });

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

      console.log(`✅ ${archivosSubidos.length} de ${files.length} archivos subidos correctamente`);

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
      console.error('❌ Error al subir archivos:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al subir archivos',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  }
}

module.exports = new HistorialMedicoController();