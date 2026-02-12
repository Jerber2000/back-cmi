
const { prisma } = require('../config/prisma');

class HistorialMedicoService {

  async obtenerHistorialPorPaciente(idpaciente) {
    try {
      const pacienteExiste = await prisma.paciente.findUnique({
        where: { idpaciente: parseInt(idpaciente) }
      });

      if (!pacienteExiste) {
        return {
          success: false,
          message: 'Paciente no encontrado',
          data: null
        };
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
          },
          clinica: {  
            select: {
              idclinica: true,
              nombreclinica: true
            }
          }
        },
        orderBy: { fechacreacion: 'desc' }
      });
      
      return {
        success: true,
        message: 'Historial obtenido correctamente',
        data: historial,
        total: historial.length
      };

    } catch (error) {
      console.error('Error en obtenerHistorialPorPaciente (service):', error);
      throw error;
    }
  }

  async obtenerInfoPaciente(idpaciente) {
    try {
      const paciente = await prisma.paciente.findUnique({
        where: { idpaciente: parseInt(idpaciente) },
        select: {
          idpaciente: true,
          nombres: true,
          apellidos: true,
          cui: true,
          genero: true,
          fkclinica: true,
          rutafotoperfil: true,
          telefonopersonal: true,
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
        return {
          success: false,
          message: 'Paciente no encontrado',
          data: null
        };
      }

      return {
        success: true,
        message: 'Información del paciente obtenida correctamente',
        data: paciente
      };

    } catch (error) {
      console.error('Error en obtenerInfoPaciente (service):', error);
      throw error;
    }
  }

async crearSesion(datos, usuarioCreador, tx = null) {
  try {
    const prismaClient = tx || prisma;
    const { 
      fkpaciente, 
      fkusuario,
      fkclinica,
      fkclinicaUsuario,
      fecha,
      recordatorio,
      notaconsulta,
      motivoconsulta,
      evolucion,
      diagnosticotratamiento
    } = datos;

    const [pacienteExiste, usuarioExiste] = await Promise.all([
      prisma.paciente.findUnique({ where: { idpaciente: parseInt(fkpaciente) }}),
      prisma.usuario.findUnique({ where: { idusuario: parseInt(fkusuario) }})
    ]);

    if (!pacienteExiste) {
      return {
        success: false,
        message: 'Paciente no encontrado',
        data: null
      };
    }

    if (!usuarioExiste) {
      return {
        success: false,
        message: 'Usuario no encontrado',
        data: null
      };
    }

    const clinicaId = fkclinicaUsuario || fkclinica || pacienteExiste.fkclinica || null;
    
    console.log('🏥 Service: Usando fkclinica:', clinicaId);

    const nuevaSesion = await prismaClient.detallehistorialclinico.create({
      data: {
        fkpaciente: parseInt(fkpaciente),
        fkusuario: parseInt(fkusuario),
        fkclinica: clinicaId,
        fecha: new Date(fecha),
        recordatorio: recordatorio || null,
        notaconsulta: notaconsulta || null,
        motivoconsulta,
        evolucion: evolucion || null,
        diagnosticotratamiento: diagnosticotratamiento || null,
        rutahistorialclinico: null,
        usuariocreacion: usuarioCreador,
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
        },
        clinica: {
          select: {
            idclinica: true,
            nombreclinica: true
          }
        }
      }
    });

    return {
      success: true,
      message: 'Sesión de historial creada correctamente',
      data: nuevaSesion
    };

  } catch (error) {
    console.error('Error en crearSesion (service):', error);
    throw error;
  }
}

  async obtenerHistorialPorClinica(fkclinica, filtros = {}) {
    try {
      const where = {
        fkclinica: parseInt(fkclinica),
        estado: 1,
        ...filtros
      };

      const historial = await prisma.detallehistorialclinico.findMany({
        where,
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
              idpaciente: true,
              nombres: true,
              apellidos: true,
              cui: true
            }
          },
          clinica: {
            select: {
              idclinica: true,
              nombreclinica: true
            }
          }
        },
        orderBy: { fechacreacion: 'desc' }
      });

      return {
        success: true,
        message: 'Historial por clínica obtenido correctamente',
        data: historial,
        total: historial.length
      };

    } catch (error) {
      console.error('Error en obtenerHistorialPorClinica (service):', error);
      throw error;
    }
  }

  async actualizarSesion(idhistorial, datos, usuarioModificador, tx = null) {
    try {
      const prismaClient = tx || prisma;
      const { 
        recordatorio,
        notaconsulta,
        motivoconsulta,
        evolucion,
        diagnosticotratamiento
      } = datos;

      const sesionExiste = await prisma.detallehistorialclinico.findUnique({
        where: { idhistorial: parseInt(idhistorial) }
      });

      if (!sesionExiste) {
        return {
          success: false,
          message: 'Sesión de historial no encontrada',
          data: null
        };
      }

      const sesionActualizada = await prismaClient.detallehistorialclinico.update({
        where: { idhistorial: parseInt(idhistorial) },
        data: {
          recordatorio,
          notaconsulta,
          motivoconsulta,
          evolucion,
          diagnosticotratamiento,
          usuariomodificacion: usuarioModificador,
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

      return {
        success: true,
        message: 'Sesión actualizada correctamente',
        data: sesionActualizada
      };

    } catch (error) {
      console.error('Error en actualizarSesion (service):', error);
      throw error;
    }
  }

  async eliminarSesion(idhistorial, usuarioModificador, tx = null) {
    try {
      const prismaClient = tx || prisma;
      
      const sesionExiste = await prisma.detallehistorialclinico.findUnique({
        where: { idhistorial: parseInt(idhistorial) }
      });

      if (!sesionExiste) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          data: null
        };
      }

      await prismaClient.detallehistorialclinico.update({
        where: { idhistorial: parseInt(idhistorial) },
        data: {
          estado: 0,
          usuariomodificacion: usuarioModificador,
          fechamodificacion: new Date()
        }
      });

      return {
        success: true,
        message: 'Sesión eliminada correctamente',
        data: null
      };

    } catch (error) {
      console.error('Error en eliminarSesion (service):', error);
      throw error;
    }
  }

  async actualizarRutaArchivos(idhistorial, rutaarchivos, usuarioModificador) {
    try {
      const sesionExiste = await prisma.detallehistorialclinico.findUnique({
        where: { idhistorial: parseInt(idhistorial) }
      });

      if (!sesionExiste) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          data: null
        };
      }

      const sesionActualizada = await prisma.detallehistorialclinico.update({
        where: { idhistorial: parseInt(idhistorial) },
        data: {
          rutahistorialclinico: rutaarchivos,
          usuariomodificacion: usuarioModificador,
          fechamodificacion: new Date()
        }
      });

      return {
        success: true,
        message: 'Archivos de sesión actualizados correctamente',
        data: sesionActualizada
      };

    } catch (error) {
      console.error('Error en actualizarRutaArchivos (service):', error);
      throw error;
    }
  }

  async obtenerArchivosSesion(idhistorial) {
    try {
      const sesion = await prisma.detallehistorialclinico.findUnique({
        where: { idhistorial: parseInt(idhistorial) },
        select: {
          rutahistorialclinico: true
        }
      });

      if (!sesion) {
        return {
          success: false,
          message: 'Sesión no encontrada',
          data: []
        };
      }

      let archivos = [];
      
      if (sesion.rutahistorialclinico) {
        try {
          if (typeof sesion.rutahistorialclinico === 'string') {
            const rutas = sesion.rutahistorialclinico.split(',').filter(r => r.trim());
            
            archivos = rutas.map(ruta => {
              const rutaLimpia = ruta.trim();
              const nombreArchivo = rutaLimpia.split('/').pop();
              const esImagen = /\.(jpg|jpeg|png|gif|webp)$/i.test(nombreArchivo);
              
              return {
                id: Date.now() + Math.random(),
                nombre: nombreArchivo,
                nombreOriginal: nombreArchivo,
                ruta: rutaLimpia,
                rutaServicio: rutaLimpia,
                url: `/api/files/${nombreArchivo}`,
                tipo: esImagen ? 'imagen' : 'documento',
                categoria: esImagen ? 'imagen' : 'documento'
              };
            });
          } else {
            archivos = JSON.parse(sesion.rutahistorialclinico);
          }
          
        } catch (parseError) {
          console.error('Error parseando rutas de archivos:', parseError);
          archivos = [{
            id: Date.now(),
            nombre: sesion.rutahistorialclinico.split('/').pop(),
            ruta: sesion.rutahistorialclinico,
            rutaServicio: sesion.rutahistorialclinico,
            url: `/api/files/${sesion.rutahistorialclinico.split('/').pop()}`
          }];
        }
      }

      return {
        success: true,
        message: 'Archivos obtenidos correctamente',
        data: archivos,
        total: archivos.length
      };

    } catch (error) {
      console.error('Error en obtenerArchivosSesion (service):', error);
      throw error;
    }
  }

  async validarPacienteExiste(idpaciente) {
    const paciente = await prisma.paciente.findUnique({
      where: { idpaciente: parseInt(idpaciente) }
    });
    return !!paciente;
  }
}

module.exports = new HistorialMedicoService();