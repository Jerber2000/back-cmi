// services/expedienteService.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

class ExpedienteService {
  /**
   * Genera un número de expediente automático único
   */
  async generarNumeroExpediente() {
    try {
      // Obtener el último expediente creado
      const ultimoExpediente = await prisma.expediente.findFirst({
        orderBy: {
          idexpediente: 'desc'
        },
        select: {
          numeroexpediente: true
        }
      });

      let nuevoNumero;
      
      if (ultimoExpediente && ultimoExpediente.numeroexpediente) {
        // Extraer el número del formato "EXP-0001"
        const match = ultimoExpediente.numeroexpediente.match(/EXP-(\d+)/);
        if (match) {
          const ultimoNum = parseInt(match[1]);
          const siguienteNum = ultimoNum + 1;
          nuevoNumero = `EXP-${siguienteNum.toString().padStart(4, '0')}`;
        } else {
          nuevoNumero = 'EXP-0001';
        }
      } else {
        nuevoNumero = 'EXP-0001';
      }

      // Verificar que no exista (por si acaso)
      const existe = await prisma.expediente.findUnique({
        where: { numeroexpediente: nuevoNumero }
      });

      if (existe) {
        // Si existe, generar uno aleatorio
        const timestamp = Date.now().toString().slice(-6);
        nuevoNumero = `EXP-${timestamp}`;
      }

      return {
        success: true,
        data: { numeroexpediente: nuevoNumero }
      };
    } catch (error) {
      console.error('Error en generarNumeroExpediente:', error);
      throw error;
    }
  }

  /**
   * Obtiene todos los expedientes con paginación, búsqueda y filtro por clínica
   */
  async obtenerTodosLosExpedientes(pagina = 1, limite = 10, busqueda = '', fkclinica = null) {
    try {
      const saltar = (parseInt(pagina) - 1) * parseInt(limite);

      // Construir condición de búsqueda
      const condicionBusqueda = busqueda ? {
        OR: [
          { numeroexpediente: { contains: busqueda, mode: 'insensitive' } },
          { 
            paciente: {
              OR: [
                { nombres: { contains: busqueda, mode: 'insensitive' } },
                { apellidos: { contains: busqueda, mode: 'insensitive' } },
                { cui: { contains: busqueda, mode: 'insensitive' } }
              ]
            }
          }
        ]
      } : {};

      // ✅ NUEVO: Construir condición de filtro por clínica (a través de paciente)
      const condicionClinica = fkclinica ? {
        paciente: {
          fkclinica: parseInt(fkclinica)
        }
      } : {};

      const whereCondition = {
        estado: 1,
        ...condicionBusqueda,
        ...condicionClinica
      };

      const [expedientes, total] = await Promise.all([
        prisma.expediente.findMany({
          where: whereCondition,
          skip: saltar,
          take: parseInt(limite),
          orderBy: {
            fechacreacion: 'desc'
          },
          include: {
            paciente: {
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
              }
            }
          }
        }),
        prisma.expediente.count({
          where: whereCondition
        })
      ]);

      return {
        success: true,
        data: expedientes,
        pagination: {
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          total,
          totalPaginas: Math.ceil(total / parseInt(limite))
        }
      };
    } catch (error) {
      console.error('Error en obtenerTodosLosExpedientes:', error);
      throw error;
    }
  }

  /**
   * Obtiene un expediente específico por su ID
   */
  async obtenerExpedientePorId(id) {
    try {
      const expediente = await prisma.expediente.findFirst({
        where: {
          idexpediente: parseInt(id),
          estado: 1
        },
        include: {
          paciente: {
            select: {
              idpaciente: true,
              nombres: true,
              apellidos: true,
              cui: true,
              fechanacimiento: true,
              genero: true,
              telefonopersonal: true,
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
            }
          }
        }
      });

      if (!expediente) {
        return {
          success: false,
          message: 'Expediente no encontrado'
        };
      }

      return {
        success: true,
        data: expediente
      };
    } catch (error) {
      console.error('Error en obtenerExpedientePorId:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo expediente médico
   */
  async crearExpediente(datosExpediente, usuarioCreador) {
    try {
      const {
        fkpaciente,
        numeroexpediente,
        generarAutomatico,
        historiaenfermedad,
        antmedico,
        antmedicamento,
        anttraumaticos,
        antfamiliar,
        antalergico,
        antmedicamentos,
        antsustancias,
        antintolerantelactosa,
        antfisoinmunizacion,
        antfisocrecimiento,
        antfisohabitos,
        antfisoalimentos,
        gineobsprenatales,
        gineobsnatales,
        gineobspostnatales,
        gineobsgestas,
        gineobspartos,
        gineobsabortos,
        gineobscesareas,
        gineobshv,
        gineobsmh,
        gineobsfur,
        gineobsciclos,
        gineobsmenarquia,
        examenfistc,
        examenfispa,
        examenfisfc,
        examenfisfr,
        examenfissao2,
        examenfispeso,
        examenfistalla,
        examenfisimc,
        examenfisgmt
      } = datosExpediente;

      // Verificar que el paciente existe
      if (fkpaciente) {
        const pacienteExiste = await prisma.paciente.findFirst({
          where: {
            idpaciente: parseInt(fkpaciente),
            estado: 1
          }
        });

        if (!pacienteExiste) {
          return {
            success: false,
            message: 'El paciente especificado no existe o está inactivo'
          };
        }

        // Verificar si el paciente ya tiene un expediente activo
        const expedienteExistente = await prisma.expediente.findFirst({
          where: {
            fkpaciente: parseInt(fkpaciente),
            estado: 1
          }
        });

        if (expedienteExistente) {
          return {
            success: false,
            message: 'El paciente ya tiene un expediente activo'
          };
        }
      }

      // Determinar número de expediente
      let numeroFinal = numeroexpediente;
      
      if (generarAutomatico || !numeroexpediente) {
        const resultado = await this.generarNumeroExpediente();
        numeroFinal = resultado.data.numeroexpediente;
      } else {
        // Verificar unicidad del número manual
        const existeNumero = await prisma.expediente.findUnique({
          where: { numeroexpediente: numeroFinal }
        });

        if (existeNumero) {
          return {
            success: false,
            message: 'Ya existe un expediente con ese número'
          };
        }
      }

      const expediente = await prisma.expediente.create({
        data: {
          fkpaciente: fkpaciente ? parseInt(fkpaciente) : null,
          numeroexpediente: numeroFinal,
          historiaenfermedad,
          antmedico,
          antmedicamento,
          anttraumaticos,
          antfamiliar,
          antalergico,
          antmedicamentos,
          antsustancias,
          antintolerantelactosa: antintolerantelactosa ? parseInt(antintolerantelactosa) : 0,
          antfisoinmunizacion,
          antfisocrecimiento,
          antfisohabitos,
          antfisoalimentos,
          gineobsprenatales,
          gineobsnatales,
          gineobspostnatales,
          gineobsgestas: gineobsgestas ? parseInt(gineobsgestas) : null,
          gineobspartos: gineobspartos ? parseInt(gineobspartos) : null,
          gineobsabortos: gineobsabortos ? parseInt(gineobsabortos) : null,
          gineobscesareas: gineobscesareas ? parseInt(gineobscesareas) : null,
          gineobshv,
          gineobsmh,
          gineobsfur: gineobsfur ? new Date(gineobsfur) : null,
          gineobsciclos,
          gineobsmenarquia,
          examenfistc: examenfistc ? parseFloat(examenfistc) : null,
          examenfispa,
          examenfisfc: examenfisfc ? parseInt(examenfisfc) : null,
          examenfisfr: examenfisfr ? parseInt(examenfisfr) : null,
          examenfissao2: examenfissao2 ? parseFloat(examenfissao2) : null,
          examenfispeso: examenfispeso ? parseFloat(examenfispeso) : null,
          examenfistalla: examenfistalla ? parseFloat(examenfistalla) : null,
          examenfisimc: examenfisimc ? parseFloat(examenfisimc) : null,
          examenfisgmt,
          usuariocreacion: usuarioCreador,
          estado: 1
        },
        include: {
          paciente: {
            select: {
              idpaciente: true,
              nombres: true,
              apellidos: true,
              cui: true,
              fkclinica: true,
              clinica: {
                select: {
                  idclinica: true,
                  nombreclinica: true
                }
              }
            }
          }
        }
      });

      return {
        success: true,
        message: 'Expediente creado exitosamente',
        data: expediente
      };
    } catch (error) {
      console.error('Error en crearExpediente:', error);
      throw error;
    }
  }

  /**
   * Actualiza un expediente existente
   */
  async actualizarExpediente(id, datosActualizacion, usuarioModificador) {
    try {
      // Verificar que el expediente existe
      const expedienteExistente = await prisma.expediente.findFirst({
        where: {
          idexpediente: parseInt(id),
          estado: 1
        }
      });

      if (!expedienteExistente) {
        return {
          success: false,
          message: 'Expediente no encontrado'
        };
      }

      // Verificar unicidad del número si se está actualizando
      if (datosActualizacion.numeroexpediente && 
          datosActualizacion.numeroexpediente !== expedienteExistente.numeroexpediente) {
        const numeroExiste = await prisma.expediente.findFirst({
          where: {
            numeroexpediente: datosActualizacion.numeroexpediente,
            idexpediente: { not: parseInt(id) }
          }
        });

        if (numeroExiste) {
          return {
            success: false,
            message: 'Ya existe un expediente con ese número'
          };
        }
      }

      // Procesar campos numéricos y fechas
      if (datosActualizacion.gineobsfur) {
        datosActualizacion.gineobsfur = new Date(datosActualizacion.gineobsfur);
      }

      // Convertir campos a sus tipos correctos
      ['antintolerantelactosa', 'gineobsgestas', 'gineobspartos', 'gineobsabortos', 
       'gineobscesareas', 'examenfisfc', 'examenfisfr'].forEach(campo => {
        if (datosActualizacion[campo]) {
          datosActualizacion[campo] = parseInt(datosActualizacion[campo]);
        }
      });

      ['examenfistc', 'examenfissao2', 'examenfispeso', 'examenfistalla', 
       'examenfisimc'].forEach(campo => {
        if (datosActualizacion[campo]) {
          datosActualizacion[campo] = parseFloat(datosActualizacion[campo]);
        }
      });

      const expedienteActualizado = await prisma.expediente.update({
        where: {
          idexpediente: parseInt(id)
        },
        data: {
          ...datosActualizacion,
          usuariomodificacion: usuarioModificador,
          fechamodificacion: new Date()
        },
        include: {
          paciente: {
            select: {
              idpaciente: true,
              nombres: true,
              apellidos: true,
              cui: true,
              fkclinica: true,
              clinica: {
                select: {
                  idclinica: true,
                  nombreclinica: true
                }
              }
            }
          }
        }
      });

      return {
        success: true,
        message: 'Expediente actualizado exitosamente',
        data: expedienteActualizado
      };
    } catch (error) {
      console.error('Error en actualizarExpediente:', error);
      throw error;
    }
  }

  /**
   * Elimina lógicamente un expediente
   */
  async eliminarExpediente(id, usuarioModificador) {
    try {
      // Verificar que el expediente existe
      const expedienteExistente = await prisma.expediente.findFirst({
        where: {
          idexpediente: parseInt(id),
          estado: 1
        }
      });

      if (!expedienteExistente) {
        return {
          success: false,
          message: 'Expediente no encontrado'
        };
      }

      // Verificar referencias activas
      const [referenciasActivas] = await Promise.all([
        prisma.detallereferirpaciente.count({
          where: {
            fkexpediente: parseInt(id),
            estado: 1
          }
        })
      ]);

      if (referenciasActivas > 0) {
        return {
          success: false,
          message: `No se puede eliminar el expediente. Tiene ${referenciasActivas} referencias activas.`,
          details: {
            referenciasActivas
          }
        };
      }

      const expedienteEliminado = await prisma.expediente.update({
        where: {
          idexpediente: parseInt(id)
        },
        data: {
          estado: 0,
          usuariomodificacion: usuarioModificador,
          fechamodificacion: new Date()
        }
      });

      return {
        success: true,
        message: 'Expediente eliminado correctamente',
        data: expedienteEliminado
      };
    } catch (error) {
      console.error('Error en eliminarExpediente:', error);
      
      if (error.code === 'P2003') {
        return {
          success: false,
          message: 'No se puede eliminar el expediente porque tiene datos relacionados'
        };
      }

      throw error;
    }
  }

  /**
   * Obtiene expedientes disponibles (sin paciente asignado)
   */
  async obtenerExpedientesDisponibles() {
    try {
      const expedientesDisponibles = await prisma.expediente.findMany({
        where: {
          estado: 1,
          fkpaciente: null
        },
        select: {
          idexpediente: true,
          numeroexpediente: true,
          fechacreacion: true
        },
        orderBy: {
          numeroexpediente: 'asc'
        }
      });

      return {
        success: true,
        data: expedientesDisponibles
      };
    } catch (error) {
      console.error('Error en obtenerExpedientesDisponibles:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de expedientes
   */
  async obtenerEstadisticas() {
    try {
      const [
        totalExpedientes,
        expedientesConPaciente,
        expedientesSinPaciente,
        expedientesRecientes
      ] = await Promise.all([
        prisma.expediente.count({
          where: { estado: 1 }
        }),

        prisma.expediente.count({
          where: {
            estado: 1,
            fkpaciente: { not: null }
          }
        }),

        prisma.expediente.count({
          where: {
            estado: 1,
            fkpaciente: null
          }
        }),

        prisma.expediente.count({
          where: {
            estado: 1,
            fechacreacion: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      // ✅ NUEVO: Obtener conteo por clínica manualmente (sin groupBy vacío)
      const expedientesConClinica = await prisma.expediente.findMany({
        where: {
          estado: 1,
          paciente: {
            fkclinica: { not: null }
          }
        },
        include: {
          paciente: {
            select: {
              fkclinica: true,
              clinica: {
                select: {
                  idclinica: true,
                  nombreclinica: true
                }
              }
            }
          }
        }
      });

      // Agrupar por clínica manualmente
      const porClinica = {};
      expedientesConClinica.forEach(exp => {
        const clinicaId = exp.paciente?.fkclinica;
        const clinicaNombre = exp.paciente?.clinica?.nombreclinica || 'Sin clínica';
        
        if (clinicaId) {
          if (!porClinica[clinicaId]) {
            porClinica[clinicaId] = {
              idclinica: clinicaId,
              nombreclinica: clinicaNombre,
              cantidad: 0
            };
          }
          porClinica[clinicaId].cantidad++;
        }
      });

      return {
        success: true,
        data: {
          totalExpedientes,
          expedientesConPaciente,
          expedientesSinPaciente,
          expedientesRecientes,
          expedientesPorClinica: Object.values(porClinica)
        }
      };
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      throw error;
    }
  }
}

module.exports = new ExpedienteService();