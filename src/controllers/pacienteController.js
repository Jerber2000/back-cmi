// controllers/pacienteController.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

class PacienteController {
  // Obtener todos los pacientes con paginación
  static async getAllPacientes(req, res) {
    try {
      const { page = 1, limit = 10, search = '' } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const whereCondition = search ? {
        OR: [
          { nombres: { contains: search, mode: 'insensitive' } },
          { apellidos: { contains: search, mode: 'insensitive' } },
          { cui: { contains: search, mode: 'insensitive' } }
        ]
      } : {};

      const [pacientes, total] = await Promise.all([
        prisma.paciente.findMany({
          where: {
            estado: 1,
            ...whereCondition
          },
          include: {
            expediente: {
              select: {
                numeroexpediente: true,
                historiaenfermedad: true
              }
            }
          },
          skip,
          take: parseInt(limit),
          orderBy: {
            fechacreacion: 'desc'
          }
        }),
        prisma.paciente.count({
          where: {
            estado: 1,
            ...whereCondition
          }
        })
      ]);

      res.json({
        success: true,
        data: pacientes,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error al obtener pacientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener un paciente por ID
  static async getPacienteById(req, res) {
    try {
      const { id } = req.params;

      const paciente = await prisma.paciente.findFirst({
        where: {
          idpaciente: parseInt(id),
          estado: 1
        },
        include: {
          expediente: true,
          agenda: {
            include: {
              usuario: {
                select: {
                  nombres: true,
                  apellidos: true,
                  puesto: true
                }
              }
            },
            orderBy: {
              fechaatencion: 'desc'
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

      res.json({
        success: true,
        data: paciente
      });
    } catch (error) {
      console.error('Error al obtener paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Crear nuevo paciente con expediente
  static async createPaciente(req, res) {
    try {
      const {
        // Datos del paciente
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
        // Datos del expediente
        numeroexpediente,
        historiaenfermedad,
        antmedico,
        antmedicamento,
        anttraumaticos,
        antfamiliar,
        antalergico
      } = req.body;

      const { usuario } = req.usuario; // Del middleware de autenticación

      // Verificar que el CUI no exista
      const existingPaciente = await prisma.paciente.findUnique({
        where: { cui }
      });

      if (existingPaciente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un paciente con ese CUI'
        });
      }

      // Generar número de expediente si no se proporciona
      let numeroExp = numeroexpediente;
      if (!numeroExp) {
        const año = new Date().getFullYear();
        const ultimoExpediente = await prisma.expediente.findFirst({
          where: {
            numeroexpediente: {
              startsWith: año.toString()
            }
          },
          orderBy: {
            numeroexpediente: 'desc'
          }
        });

        let numeroSecuencial = 1;
        if (ultimoExpediente) {
          const ultimoNumero = ultimoExpediente.numeroexpediente;
          const parteSecuencial = ultimoNumero.split('-')[1];
          numeroSecuencial = parseInt(parteSecuencial) + 1;
        }

        numeroExp = `${año}-${numeroSecuencial.toString().padStart(6, '0')}`;
      }

      // Crear expediente y paciente en una transacción
      const result = await prisma.$transaction(async (tx) => {
        // Crear expediente
        const expediente = await tx.expediente.create({
          data: {
            numeroexpediente: numeroExp,
            historiaenfermedad,
            antmedico,
            antmedicamento,
            anttraumaticos,
            antfamiliar,
            antalergico,
            usuariocreacion: usuario
          }
        });

        // Crear paciente
        const paciente = await tx.paciente.create({
          data: {
            fkexpediente: expediente.idexpediente,
            nombres,
            apellidos,
            cui,
            fechanacimiento: new Date(fechanacimiento),
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
            usuariocreacion: usuario
          },
          include: {
            expediente: true
          }
        });

        return paciente;
      });

      res.status(201).json({
        success: true,
        message: 'Paciente creado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Error al crear paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Actualizar paciente
  static async updatePaciente(req, res) {
    try {
      const { id } = req.params;
      const { usuario } = req.usuario;
      const updateData = { ...req.body };

      // Verificar que el paciente existe
      const existingPaciente = await prisma.paciente.findFirst({
        where: {
          idpaciente: parseInt(id),
          estado: 1
        }
      });

      if (!existingPaciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Si se está actualizando el CUI, verificar que no exista
      if (updateData.cui && updateData.cui !== existingPaciente.cui) {
        const cuiExists = await prisma.paciente.findUnique({
          where: { cui: updateData.cui }
        });

        if (cuiExists) {
          return res.status(400).json({
            success: false,
            message: 'Ya existe un paciente con ese CUI'
          });
        }
      }

      // Procesar fecha de nacimiento si viene en el update
      if (updateData.fechanacimiento) {
        updateData.fechanacimiento = new Date(updateData.fechanacimiento);
      }

      // Actualizar paciente
      const pacienteActualizado = await prisma.paciente.update({
        where: {
          idpaciente: parseInt(id)
        },
        data: {
          ...updateData,
          usuariomodificacion: usuario,
          fechamodificacion: new Date()
        },
        include: {
          expediente: true
        }
      });

      res.json({
        success: true,
        message: 'Paciente actualizado exitosamente',
        data: pacienteActualizado
      });
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Eliminar paciente (soft delete)
  static async deletePaciente(req, res) {
    try {
      const { id } = req.params;
      const { usuario } = req.usuario;

      // Verificar que el paciente existe
      const existingPaciente = await prisma.paciente.findFirst({
        where: {
          idpaciente: parseInt(id),
          estado: 1
        }
      });

      if (!existingPaciente) {
        return res.status(404).json({
          success: false,
          message: 'Paciente no encontrado'
        });
      }

      // Soft delete
      await prisma.paciente.update({
        where: {
          idpaciente: parseInt(id)
        },
        data: {
          estado: 0,
          usuariomodificacion: usuario,
          fechamodificacion: new Date()
        }
      });

      res.json({
        success: true,
        message: 'Paciente eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // Obtener estadísticas básicas
  static async getEstadisticas(req, res) {
    try {
      const [
        totalPacientes,
        pacientesPorGenero,
        pacientesRecientes
      ] = await Promise.all([
        // Total de pacientes activos
        prisma.paciente.count({
          where: { estado: 1 }
        }),
        
        // Pacientes por género
        prisma.paciente.groupBy({
          by: ['genero'],
          where: { estado: 1 },
          _count: {
            genero: true
          }
        }),

        // Pacientes registrados recientemente (últimos 7 días)
        prisma.paciente.count({
          where: {
            estado: 1,
            fechacreacion: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      res.json({
        success: true,
        data: {
          totalPacientes,
          pacientesPorGenero,
          pacientesRecientes
        }
      });
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = PacienteController;