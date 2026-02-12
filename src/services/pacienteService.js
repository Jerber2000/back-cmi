
const { prisma } = require('../config/prisma');

class PacienteService {

  async obtenerTodosLosPacientes(pagina = 1, limite = 10, busqueda = '', fkclinica = null) {
    try {
      const saltar = (parseInt(pagina) - 1) * parseInt(limite);

      const condicionBusqueda = busqueda ? {
        OR: [
          { nombres: { contains: busqueda, mode: 'insensitive' } },
          { apellidos: { contains: busqueda, mode: 'insensitive' } },
          { cui: { contains: busqueda, mode: 'insensitive' } }
        ]
      } : {};

      const condicionClinica = fkclinica ? { fkclinica: parseInt(fkclinica) } : {};

      const whereCondition = {
        estado: 1,
        ...condicionBusqueda,
        ...condicionClinica
      };

      const [pacientes, total] = await Promise.all([
        prisma.paciente.findMany({
          where: whereCondition,
          skip: saltar,
          take: parseInt(limite),
          orderBy: {
            fechacreacion: 'desc'
          },
          include: {
            expedientes: {
              select: {
                idexpediente: true,
                numeroexpediente: true,
                historiaenfermedad: true
              }
            },
            clinica: {
              select: {
                idclinica: true,
                nombreclinica: true
              }
            }
          }
        }),
        prisma.paciente.count({
          where: whereCondition
        })
      ]);

      return {
        success: true,
        data: pacientes,
        pagination: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total,
          totalPaginas: Math.ceil(total / parseInt(limite))
        }
      };
    } catch (error) {
      console.error('Error en obtenerTodosLosPacientes:', error);
      throw error;
    }
  }

  async listadoPacientes() {
    try {
      const pacienteListado = await prisma.paciente.findMany({
        select: {
          idpaciente: true,
          nombres: true,
          apellidos: true,
          cui: true,
          nombreencargado: true,
          telefonoencargado: true,
          municipio: true,
          aldea: true,
          direccion: true,
          fkclinica: true,
          clinica: {
            select: {
              idclinica: true,
              nombreclinica: true
            }
          }
        },
        where: {
          estado: 1
        },
        orderBy: {
          nombres: 'asc'
        }
      });

      return {
        success: true,
        data: pacienteListado
      };
    } catch (error) {
      console.error('Error en listadoPacientes:', error);
      throw error;
    }
  }

  async obtenerPacientePorId(id) {
    try {
      const paciente = await prisma.paciente.findFirst({
        where: {
          idpaciente: parseInt(id),
          estado: 1
        },
        include: {
          expedientes: {
            select: {
              idexpediente: true,
              numeroexpediente: true,
              historiaenfermedad: true,
              fechacreacion: true
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

      if (!paciente) {
        return {
          success: false,
          message: 'Paciente no encontrado'
        };
      }

      return {
        success: true,
        data: paciente
      };
    } catch (error) {
      console.error('Error en obtenerPacientePorId:', error);
      throw error;
    }
  }

  async crearPaciente(datosPaciente, usuarioCreador, tx = null) {
    try {

      const prismaClient = tx || prisma;

      const {
        nombres,
        apellidos,
        cui,
        fechanacimiento,
        genero,
        tipoconsulta,
        tipodiscapacidad,
        telefonopersonal,
        nombrecontactoemergencia,
        telefonoemergencia,
        nombreencargado,
        dpiencargado,
        telefonoencargado,
        municipio,
        aldea,
        direccion,
        fkclinica
      } = datosPaciente;

      const pacienteExistente = await prismaClient.paciente.findUnique({
        where: { cui }
      });

      if (pacienteExistente) {
        return {
          success: false,
          message: 'Ya existe un paciente con ese CUI'
        };
      }

      if (fkclinica) {
        const clinicaExiste = await prismaClient.clinica.findFirst({
          where: {
            idclinica: parseInt(fkclinica),
            estado: 1
          }
        });

        if (!clinicaExiste) {
          return {
            success: false,
            message: 'La clínica seleccionada no existe o está inactiva'
          };
        }
      }

      const paciente = await prismaClient.paciente.create({
        data: {
          nombres,
          apellidos,
          cui,
          fechanacimiento: new Date(fechanacimiento),
          genero,
          tipoconsulta,
          tipodiscapacidad: tipodiscapacidad || 'Ninguna',
          telefonopersonal,
          nombrecontactoemergencia,
          telefonoemergencia,
          nombreencargado,
          dpiencargado,
          telefonoencargado,
          municipio,
          aldea,
          direccion,
          fkclinica: fkclinica ? parseInt(fkclinica) : null,
          usuariocreacion: usuarioCreador,
          estado: 1
        },
        include: {
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
        message: 'Paciente creado exitosamente',
        data: paciente
      };
    } catch (error) {
      console.error('Error en crearPaciente:', error);
      throw error;
    }
  }

  async actualizarPaciente(id, datosActualizacion, usuarioModificador, tx = null) {
    try {
      const prismaClient = tx || prisma;
      
      const pacienteExistente = await prismaClient.paciente.findFirst({
        where: {
          idpaciente: parseInt(id),
          estado: 1
        }
      });

      if (!pacienteExistente) {
        return {
          success: false,
          message: 'Paciente no encontrado'
        };
      }

      if (datosActualizacion.cui && datosActualizacion.cui !== pacienteExistente.cui) {
        const cuiExiste = await prismaClient.paciente.findFirst({
          where: {
            cui: datosActualizacion.cui,
            idpaciente: { not: parseInt(id) }
          }
        });

        if (cuiExiste) {
          return {
            success: false,
            message: 'Ya existe un paciente con ese CUI'
          };
        }
      }

      if (datosActualizacion.fkclinica) {
        const clinicaExiste = await prismaClient.clinica.findFirst({
          where: {
            idclinica: parseInt(datosActualizacion.fkclinica),
            estado: 1
          }
        });

        if (!clinicaExiste) {
          return {
            success: false,
            message: 'La clínica seleccionada no existe o está inactiva'
          };
        }
      }

      if (datosActualizacion.fechanacimiento) {
        datosActualizacion.fechanacimiento = new Date(datosActualizacion.fechanacimiento);
      }

      if (datosActualizacion.fkclinica) {
        datosActualizacion.fkclinica = parseInt(datosActualizacion.fkclinica);
      }

      const pacienteActualizado = await prismaClient.paciente.update({
        where: {
          idpaciente: parseInt(id)
        },
        data: {
          ...datosActualizacion,
          usuariomodificacion: usuarioModificador,
          fechamodificacion: new Date()
        },
        include: {
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
        message: 'Paciente actualizado exitosamente',
        data: pacienteActualizado
      };
    } catch (error) {
      console.error('Error en actualizarPaciente:', error);
      throw error;
    }
  }

  async eliminarPaciente(id, usuarioModificador, tx = null) {
    try {
      const prismaClient = tx || prisma;
      
      const pacienteExistente = await prismaClient.paciente.findFirst({
        where: {
          idpaciente: parseInt(id),
          estado: 1
        }
      });

      if (!pacienteExistente) {
        return {
          success: false,
          message: 'Paciente no encontrado'
        };
      }

      const [historialCount, expedientesActivos, expedientesInactivos] = await Promise.all([
        prisma.detallehistorialclinico.count({
          where: {
            fkpaciente: parseInt(id),
            estado: 1
          }
        }),
        prisma.expediente.count({
          where: {
            fkpaciente: parseInt(id),
            estado: 1
          }
        }),
        prisma.expediente.count({
          where: {
            fkpaciente: parseInt(id),
            estado: 0
          }
        })
      ]);

      if (historialCount > 0 || expedientesActivos > 0) {
        let mensajeDetallado = 'No se puede eliminar el paciente. ';

        if (historialCount > 0 && expedientesActivos > 0) {
          mensajeDetallado += `Tiene ${historialCount} registros de historial médico y ${expedientesActivos} expedientes activos.`;
        } else if (historialCount > 0) {
          mensajeDetallado += `Tiene ${historialCount} registros de historial médico.`;
        } else {
          mensajeDetallado += `Tiene ${expedientesActivos} expedientes activos.`;
        }

        mensajeDetallado += ' Debe eliminar o desactivar estos registros primero.';

        return {
          success: false,
          message: mensajeDetallado,
          details: {
            historialCount,
            expedientesActivos,
            expedientesInactivos,
            puedeEliminar: false
          }
        };
      }

      const pacienteEliminado = await prismaClient.paciente.update({
        where: {
          idpaciente: parseInt(id)
        },
        data: {
          estado: 0,
          usuariomodificacion: usuarioModificador,
          fechamodificacion: new Date()
        }
      });

      const mensaje = expedientesInactivos > 0
        ? `Paciente eliminado correctamente. Tenía ${expedientesInactivos} expedientes inactivos que se mantienen archivados.`
        : 'Paciente eliminado correctamente';

      return {
        success: true,
        message: mensaje,
        data: pacienteEliminado
      };
    } catch (error) {
      console.error('Error en eliminarPaciente:', error);
      
      if (error.code === 'P2003') {
        return {
          success: false,
          message: 'No se puede eliminar el paciente porque tiene datos relacionados (restricción de integridad referencial)'
        };
      }

      if (error.code === 'P2025') {
        return {
          success: false,
          message: 'Paciente no encontrado'
        };
      }

      throw error;
    }
  }

  async obtenerEstadisticas() {
    try {
      const [
        totalPacientes,
        pacientesPorGenero,
        pacientesRecientes,
        pacientesConExpedientes,
        pacientesPorClinica
      ] = await Promise.all([
        prisma.paciente.count({
          where: { estado: 1 }
        }),

        prisma.paciente.groupBy({
          by: ['genero'],
          where: { estado: 1 },
          _count: {
            genero: true
          }
        }),

        prisma.paciente.count({
          where: {
            estado: 1,
            fechacreacion: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        }),

        prisma.paciente.count({
          where: {
            estado: 1,
            expedientes: {
              some: {
                estado: 1
              }
            }
          }
        }),

        prisma.paciente.groupBy({
          by: ['fkclinica'],
          where: { estado: 1 },
          _count: {
            fkclinica: true
          }
        })
      ]);

      const clinicasIds = pacientesPorClinica.map(p => p.fkclinica).filter(id => id !== null);
      const clinicas = await prisma.clinica.findMany({
        where: {
          idclinica: { in: clinicasIds }
        },
        select: {
          idclinica: true,
          nombreclinica: true
        }
      });

      const pacientesPorClinicaConNombre = pacientesPorClinica.map(stat => {
        const clinica = clinicas.find(c => c.idclinica === stat.fkclinica);
        return {
          fkclinica: stat.fkclinica,
          nombreclinica: clinica ? clinica.nombreclinica : 'Sin clínica asignada',
          cantidad: stat._count.fkclinica
        };
      });

      return {
        success: true,
        data: {
          totalPacientes,
          pacientesPorGenero,
          pacientesRecientes,
          pacientesConExpedientes,
          pacientesPorClinica: pacientesPorClinicaConNombre
        }
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      throw error;
    }
  }

  async obtenerPacientesDisponibles() {
    try {
      const pacientesDisponibles = await prisma.paciente.findMany({
        where: {
          estado: 1
        },
        select: {
          idpaciente: true,
          nombres: true,
          apellidos: true,
          cui: true,
          fechanacimiento: true,
          genero: true,
          fkclinica: true,
          clinica: {
            select: {
              idclinica: true,
              nombreclinica: true
            }
          }
        },
        orderBy: [
          { apellidos: 'asc' },
          { nombres: 'asc' }
        ]
      });

      return {
        success: true,
        data: pacientesDisponibles
      };
    } catch (error) {
      console.error('Error en obtenerPacientesDisponibles:', error);
      throw error;
    }
  }
}

module.exports = new PacienteService();