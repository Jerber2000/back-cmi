// services/pacienteService.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

class PacienteService {
  /**
   * Obtiene todos los pacientes con paginación, búsqueda y filtro por clínica
   */
  async obtenerTodosLosPacientes(pagina = 1, limite = 10, busqueda = '', fkclinica = null) {
    try {
      const saltar = (parseInt(pagina) - 1) * parseInt(limite);

      // Construir condición de búsqueda
      const condicionBusqueda = busqueda ? {
        OR: [
          { nombres: { contains: busqueda, mode: 'insensitive' } },
          { apellidos: { contains: busqueda, mode: 'insensitive' } },
          { cui: { contains: busqueda, mode: 'insensitive' } }
        ]
      } : {};

      // Construir condición de filtro por clínica
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

  /**
   * Obtiene listado simple de pacientes
   */
  async listadoPacientes() {
    try {
      const pacienteListado = await prisma.paciente.findMany({
        select: {
          idpaciente: true,
          nombres: true,
          apellidos: true,
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

  /**
   * Obtiene un paciente específico por su ID
   */
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

  /**
   * Crea un nuevo paciente en el sistema
   */
  async crearPaciente(datosPaciente, usuarioCreador) {
    try {
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

      // Verificar que el CUI no exista
      const pacienteExistente = await prisma.paciente.findUnique({
        where: { cui }
      });

      if (pacienteExistente) {
        return {
          success: false,
          message: 'Ya existe un paciente con ese CUI'
        };
      }

      // Verificar que la clínica existe si se proporciona
      if (fkclinica) {
        const clinicaExiste = await prisma.clinica.findFirst({
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

      const paciente = await prisma.paciente.create({
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

  /**
   * Actualiza la información de un paciente existente
   */
  async actualizarPaciente(id, datosActualizacion, usuarioModificador) {
    try {
      // Verificar que el paciente existe
      const pacienteExistente = await prisma.paciente.findFirst({
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

      // Verificar unicidad del CUI si se está actualizando
      if (datosActualizacion.cui && datosActualizacion.cui !== pacienteExistente.cui) {
        const cuiExiste = await prisma.paciente.findFirst({
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

      // Verificar que la clínica existe si se proporciona
      if (datosActualizacion.fkclinica) {
        const clinicaExiste = await prisma.clinica.findFirst({
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

      // Procesar fecha de nacimiento si está presente
      if (datosActualizacion.fechanacimiento) {
        datosActualizacion.fechanacimiento = new Date(datosActualizacion.fechanacimiento);
      }

      // Convertir fkclinica a entero si existe
      if (datosActualizacion.fkclinica) {
        datosActualizacion.fkclinica = parseInt(datosActualizacion.fkclinica);
      }

      const pacienteActualizado = await prisma.paciente.update({
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

  /**
   * Elimina lógicamente un paciente del sistema
   */
  async eliminarPaciente(id, usuarioModificador) {
    try {
      // Verificar que el paciente existe
      const pacienteExistente = await prisma.paciente.findFirst({
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

      // Verificar expedientes activos e inactivos por separado
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

      // Solo bloquear si tiene expedientes ACTIVOS o historial médico
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

      // Eliminar lógicamente el paciente
      const pacienteEliminado = await prisma.paciente.update({
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
      
      // Manejar errores específicos de Prisma
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

  /**
   * Obtiene estadísticas básicas de los pacientes
   */
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

      // Obtener nombres de clínicas para las estadísticas
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

  /**
   * Obtiene la lista de pacientes disponibles para asignación
   */
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