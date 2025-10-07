// src/services/referirService.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const referirService = {

  // Crear nuevo referido
  async crearReferido(datos) {
    try {
      const {
        fkusuario,
        fkusuariodestino,
        fkpaciente,
        fkexpediente,
        fkclinica,
        comentario,
        usuariocreacion
      } = datos;

      // Validar que el paciente exista
      const paciente = await prisma.paciente.findUnique({
        where: { idpaciente: fkpaciente, estado: 1 }
      });

      if (!paciente) {
        throw new Error('Paciente no encontrado o inactivo');
      }

      // Validar que el expediente exista y pertenezca al paciente
      const expediente = await prisma.expediente.findFirst({
        where: {
          idexpediente: fkexpediente,
          fkpaciente: fkpaciente,
          estado: 1
        }
      });

      if (!expediente) {
        throw new Error('Expediente no encontrado o no pertenece al paciente');
      }

      // Validar que la clínica exista
      const clinica = await prisma.clinica.findUnique({
        where: { idclinica: fkclinica, estado: 1 }
      });

      if (!clinica) {
        throw new Error('Clínica no encontrada o inactiva');
      }

      // Validar que el usuario destino exista y sea médico
      const usuarioDestino = await prisma.usuario.findUnique({
        where: { idusuario: fkusuariodestino, estado: 1 },
        include: { rol: true }
      });

      if (!usuarioDestino) {
        throw new Error('Usuario destino no encontrado o inactivo');
      }

      // Crear el referido con confirmacion1 automática
      const nuevoReferido = await prisma.detallereferirpaciente.create({
        data: {
          fkusuario,
          fkusuariodestino,
          fkpaciente,
          fkexpediente,
          fkclinica,
          comentario,
          confirmacion1: 1,
          usuarioconfirma1: usuariocreacion,
          confirmacion2: 0,
          confirmacion3: 0,
          confirmacion4: 0,
          usuariocreacion,
          estado: 1
        },
        include: {
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
          },
          usuario: {
            select: {
              idusuario: true,
              nombres: true,
              apellidos: true,
              profesion: true
            }
          },
          usuarioDestino: {
            select: {
              idusuario: true,
              nombres: true,
              apellidos: true,
              profesion: true
            }
          }
        }
      });

      return nuevoReferido;

    } catch (error) {
      console.error('Error en crearReferido service:', error);
      throw error;
    }
  },

  // Obtener referidos con filtros
  async obtenerReferidos({ tipo, usuario, search, page, limit }) {
    try {
      const skip = (page - 1) * limit;
      
      // Construir filtros base
      let whereClause = {
        estado: 1
      };

      // Buscar rol del usuario
      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol.rol.nombre === 'Administrador';

      switch (tipo) {
        case 'pendientes':
          if (esAdmin) {
            // Admins ven los que les faltan aprobar
            whereClause.OR = [
              { confirmacion2: 0, confirmacion1: 1 },
              { confirmacion3: 0, confirmacion1: 1, confirmacion2: 1 }
            ];
          } else {
            // Médicos ven los que les enviaron y falta su aprobación
            whereClause.fkusuariodestino = usuario.idusuario;
            whereClause.confirmacion4 = 0;
            whereClause.confirmacion3 = 1; // Ya pasó por admins
          }
          break;

        case 'enviados':
          // Referidos que yo envié
          whereClause.fkusuario = usuario.idusuario;
          break;

        case 'recibidos':
          // Referidos que me enviaron
          whereClause.fkusuariodestino = usuario.idusuario;
          break;

        case 'completados':
          // Todos con las 4 confirmaciones
          whereClause.confirmacion1 = 1;
          whereClause.confirmacion2 = 1;
          whereClause.confirmacion3 = 1;
          whereClause.confirmacion4 = 1;
          
          if (!esAdmin) {
            // Médicos solo ven los suyos
            whereClause.OR = [
              { fkusuario: usuario.idusuario },
              { fkusuariodestino: usuario.idusuario }
            ];
          }
          break;

        default:
          // Sin filtro específico, mostrar según rol
          if (!esAdmin) {
            whereClause.OR = [
              { fkusuario: usuario.idusuario },
              { fkusuariodestino: usuario.idusuario }
            ];
          }
      }

      // Búsqueda por nombre de paciente
      if (search) {
        whereClause.paciente = {
          OR: [
            { nombres: { contains: search, mode: 'insensitive' } },
            { apellidos: { contains: search, mode: 'insensitive' } },
            { cui: { contains: search, mode: 'insensitive' } }
          ]
        };
      }

      // Ejecutar consulta con paginación
      const [referidos, total] = await Promise.all([
        prisma.detallereferirpaciente.findMany({
          where: whereClause,
          include: {
            paciente: {
              select: {
                idpaciente: true,
                nombres: true,
                apellidos: true,
                cui: true,
                fechanacimiento: true
              }
            },
            clinica: {
              select: {
                idclinica: true,
                nombreclinica: true
              }
            },
            usuario: {
              select: {
                idusuario: true,
                nombres: true,
                apellidos: true,
                profesion: true
              }
            },
            usuarioDestino: {
              select: {
                idusuario: true,
                nombres: true,
                apellidos: true,
                profesion: true
              }
            }
          },
          orderBy: {
            fechacreacion: 'desc'
          },
          skip,
          take: limit
        }),
        prisma.detallereferirpaciente.count({ where: whereClause })
      ]);

      return {
        data: referidos,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };

    } catch (error) {
      console.error('Error en obtenerReferidos service:', error);
      throw error;
    }
  },

  // Obtener referido por ID
  async obtenerReferidoPorId(id, usuario) {
    try {
      const referido = await prisma.detallereferirpaciente.findFirst({
        where: {
          idrefpaciente: id,
          estado: 1
        },
        include: {
          paciente: true,
          expediente: true,
          clinica: true,
          usuario: {
            select: {
              idusuario: true,
              nombres: true,
              apellidos: true,
              profesion: true,
              correo: true
            }
          },
          usuarioDestino: {
            select: {
              idusuario: true,
              nombres: true,
              apellidos: true,
              profesion: true,
              correo: true
            }
          }
        }
      });

      if (!referido) {
        return null;
      }

      // Verificar permisos (admin o involucrado en el referido)
      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol.rol.nombre === 'Administrador';
      const esInvolucrado = 
        referido.fkusuario === usuario.idusuario || 
        referido.fkusuariodestino === usuario.idusuario;

      if (!esAdmin && !esInvolucrado) {
        throw new Error('No tiene permisos para ver este referido');
      }

      return referido;

    } catch (error) {
      console.error('Error en obtenerReferidoPorId service:', error);
      throw error;
    }
  },

  // Confirmar/aprobar referido
  async confirmarReferido(id, usuario, comentarioAdicional) {
    try {
      // Obtener el referido actual
      const referido = await prisma.detallereferirpaciente.findFirst({
        where: {
          idrefpaciente: id,
          estado: 1
        }
      });

      if (!referido) {
        throw new Error('Referido no encontrado');
      }

      // Verificar que no esté completado
      if (referido.confirmacion4 === 1) {
        throw new Error('Este referido ya fue completado');
      }

      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol.rol.nombre === 'Administrador';
      const usuarioNombre = usuario.usuario;
      let campoActualizar = {};
      let mensaje = '';

      // Determinar qué confirmación corresponde
      if (referido.confirmacion2 === 0 && referido.confirmacion1 === 1) {
        // Confirmación 2 - Admin 1
        if (!esAdmin) {
          throw new Error('Solo administradores pueden aprobar en esta etapa');
        }
        campoActualizar = {
          confirmacion2: 1,
          usuarioconfirma2: usuarioNombre,
          usuariomodificacion: usuarioNombre,
          fechamodificacion: new Date()
        };
        mensaje = 'Aprobación 1 de administrador registrada';

      } else if (referido.confirmacion3 === 0 && referido.confirmacion2 === 1) {
        // Confirmación 3 - Admin 2
        if (!esAdmin) {
          throw new Error('Solo administradores pueden aprobar en esta etapa');
        }
        if (referido.usuarioconfirma2 === usuarioNombre) {
          throw new Error('No puede aprobar dos veces el mismo referido');
        }
        campoActualizar = {
          confirmacion3: 1,
          usuarioconfirma3: usuarioNombre,
          usuariomodificacion: usuarioNombre,
          fechamodificacion: new Date()
        };
        mensaje = 'Aprobación 2 de administrador registrada';

      } else if (referido.confirmacion4 === 0 && referido.confirmacion3 === 1) {
        // Confirmación 4 - Médico destino
        if (referido.fkusuariodestino !== usuario.idusuario) {
          throw new Error('Solo el médico asignado puede aprobar esta etapa');
        }
        campoActualizar = {
          confirmacion4: 1,
          usuarioconfirma4: usuarioNombre,
          usuariomodificacion: usuarioNombre,
          fechamodificacion: new Date()
        };
        mensaje = 'Referido completado exitosamente';

      } else {
        throw new Error('No se puede aprobar en esta etapa');
      }

      // Actualizar comentario si se proporciona
      if (comentarioAdicional) {
        const comentarioActual = referido.comentario || '';
        campoActualizar.comentario = comentarioActual 
          ? `${comentarioActual}\n---\n${usuarioNombre}: ${comentarioAdicional}`
          : comentarioAdicional;
      }

      // Ejecutar actualización
      const referidoActualizado = await prisma.detallereferirpaciente.update({
        where: { idrefpaciente: id },
        data: campoActualizar,
        include: {
          paciente: true,
          clinica: true,
          usuario: {
            select: {
              nombres: true,
              apellidos: true
            }
          },
          usuarioDestino: {
            select: {
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      return {
        referido: referidoActualizado,
        mensaje
      };

    } catch (error) {
      console.error('Error en confirmarReferido service:', error);
      throw error;
    }
  },

  // Actualizar referido (solo si no está completado)
  async actualizarReferido(id, datos, usuario) {
    try {
      const referido = await prisma.detallereferirpaciente.findFirst({
        where: {
          idrefpaciente: id,
          estado: 1
        }
      });

      if (!referido) {
        throw new Error('Referido no encontrado');
      }

      // Solo el creador puede modificar
      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol.rol.nombre === 'Administrador';

      if (referido.fkusuario !== usuario.idusuario) {
        if (!esAdmin) {
          throw new Error('Solo el médico que creó el referido puede modificarlo');
        }
      }

      // No se puede modificar si ya está completado
      if (referido.confirmacion4 === 1) {
        throw new Error('No se puede modificar un referido completado');
      }

      const datosActualizar = {
        usuariomodificacion: usuario.usuario,
        fechamodificacion: new Date()
      };

      if (datos.fkclinica) datosActualizar.fkclinica = datos.fkclinica;
      if (datos.fkusuariodestino) datosActualizar.fkusuariodestino = datos.fkusuariodestino;
      if (datos.comentario !== undefined) datosActualizar.comentario = datos.comentario;

      const referidoActualizado = await prisma.detallereferirpaciente.update({
        where: { idrefpaciente: id },
        data: datosActualizar,
        include: {
          paciente: true,
          clinica: true,
          usuario: {
            select: { nombres: true, apellidos: true }
          },
          usuarioDestino: {
            select: { nombres: true, apellidos: true }
          }
        }
      });

      return referidoActualizado;

    } catch (error) {
      console.error('Error en actualizarReferido service:', error);
      throw error;
    }
  },

  // Cambiar estado (eliminado lógico)
  async cambiarEstado(id, nuevoEstado, usuario) {
    try {
      const referido = await prisma.detallereferirpaciente.findUnique({
        where: { idrefpaciente: id }
      });

      if (!referido) {
        throw new Error('Referido no encontrado');
      }

      // Solo admin o el creador pueden cambiar estado
      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol.rol.nombre === 'Administrador';

      if (!esAdmin && referido.fkusuario !== usuario.idusuario) {
        throw new Error('No tiene permisos para cambiar el estado');
      }

      const referidoActualizado = await prisma.detallereferirpaciente.update({
        where: { idrefpaciente: id },
        data: {
          estado: nuevoEstado,
          usuariomodificacion: usuario.usuario,
          fechamodificacion: new Date()
        }
      });

      return referidoActualizado;

    } catch (error) {
      console.error('Error en cambiarEstado service:', error);
      throw error;
    }
  },

  // Historial de referidos de un paciente
  async obtenerHistorialPaciente(idPaciente) {
    try {
      const historial = await prisma.detallereferirpaciente.findMany({
        where: {
          fkpaciente: idPaciente,
          estado: 1
        },
        include: {
          clinica: {
            select: {
              nombreclinica: true
            }
          },
          usuario: {
            select: {
              nombres: true,
              apellidos: true,
              profesion: true
            }
          },
          usuarioDestino: {
            select: {
              nombres: true,
              apellidos: true,
              profesion: true
            }
          }
        },
        orderBy: {
          fechacreacion: 'desc'
        }
      });

      return historial;

    } catch (error) {
      console.error('Error en obtenerHistorialPaciente service:', error);
      throw error;
    }
  }

};

module.exports = referirService;