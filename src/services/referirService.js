// src/services/referirService.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const referirService = {

  // Crear nuevo referido
  async crearReferido(datos) {
    try {
      const {
        fkusuario,
        fkpaciente,
        fkexpediente,
        fkclinica,
        comentario,
        usuariocreacion
        // ❌ YA NO fkusuariodestino
      } = datos;

      // Validar paciente
      const paciente = await prisma.paciente.findUnique({
        where: { idpaciente: fkpaciente, estado: 1 }
      });

      if (!paciente) {
        throw new Error('Paciente no encontrado o inactivo');
      }

      // Validar expediente
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

      // Validar clínica
      const clinica = await prisma.clinica.findUnique({
        where: { idclinica: fkclinica, estado: 1 }
      });

      if (!clinica) {
        throw new Error('Clínica no encontrada o inactiva');
      }

      // ✅ Validar que existan usuarios asignados a esa clínica
      const usuariosClinica = await prisma.usuario.count({
        where: {
          fkclinica: fkclinica,
          estado: 1
        }
      });

      if (usuariosClinica === 0) {
        throw new Error(`No hay usuarios asignados a la clínica ${clinica.nombreclinica}`);
      }

      // Crear referido
      const nuevoReferido = await prisma.detallereferirpaciente.create({
        data: {
          fkusuario,
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

      const esAdmin = usuarioConRol?.rol?.nombre?.toLowerCase().includes('admin');

      switch (tipo) {
        case 'pendientes':
          if (esAdmin) {
            whereClause.OR = [
              { confirmacion2: 0, confirmacion1: 1 },
              { confirmacion3: 0, confirmacion1: 1, confirmacion2: 1 }
            ];
          } else {
            // ✅ Usuario de la clínica ve pendientes de su clínica
            whereClause.fkclinica = usuarioConRol.fkclinica;
            whereClause.confirmacion4 = 0;
            whereClause.confirmacion3 = 1;
          }
          break;

        case 'recibidos':
          // ✅ Referidos destinados a la clínica del usuario
          whereClause.fkclinica = usuarioConRol.fkclinica;
          break;

        case 'completados':
          whereClause.confirmacion1 = 1;
          whereClause.confirmacion2 = 1;
          whereClause.confirmacion3 = 1;
          whereClause.confirmacion4 = 1;
          
          if (!esAdmin) {
            whereClause.OR = [
              { fkusuario: usuario.idusuario },
              { fkclinica: usuarioConRol.fkclinica }  // ✅ Por clínica
            ];
          }
          break;

        default:
          if (!esAdmin) {
            whereClause.OR = [
              { fkusuario: usuario.idusuario },
              { fkclinica: usuarioConRol.fkclinica }  // ✅ Por clínica
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
          }
        }
      });

      if (!referido) {
        return null;
      }

      // Verificar permisos
      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol?.rol?.nombre?.toLowerCase().includes('admin');
      const esInvolucrado = 
      referido.fkusuario === usuario.idusuario || 
      usuarioConRol.fkclinica === referido.fkclinica;

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
    console.log('🚀 === INICIO confirmarReferido SERVICE ===');
    console.log('📋 ID:', id);
    console.log('👤 Usuario:', usuario);
    console.log('💬 Comentario:', comentarioAdicional);
    
    console.log('🔍 Buscando referido...');
    const referido = await prisma.detallereferirpaciente.findFirst({
      where: {
        idrefpaciente: id,
        estado: 1
      }
    });

    console.log('📄 Referido encontrado:', {
      idrefpaciente: referido?.idrefpaciente,
      confirmacion1: referido?.confirmacion1,
      confirmacion2: referido?.confirmacion2,
      confirmacion3: referido?.confirmacion3,
      confirmacion4: referido?.confirmacion4
    });

    if (!referido) {
      throw new Error('Referido no encontrado');
    }

    if (referido.confirmacion4 === 1) {
      throw new Error('Este referido ya fue completado');
    }

    console.log('🔍 Buscando usuario con rol...');
    const usuarioConRol = await prisma.usuario.findUnique({
      where: { idusuario: usuario.idusuario },
      include: { rol: true, clinica: true }
    });

    console.log('👤 Usuario con rol:', {
      idusuario: usuarioConRol?.idusuario,
      fkrol: usuarioConRol?.fkrol,
      fkclinica: usuarioConRol?.fkclinica
    });

    const esAdmin = usuarioConRol.fkrol === 1;
    const usuarioNombre = usuario.usuario;
    let campoActualizar = {};
    let mensaje = '';

    // ✅ ETAPA 2: Admin aprueba
    if (referido.confirmacion2 === 0 && referido.confirmacion1 === 1) {
      console.log('📍 Procesando ETAPA 2...');
      if (!esAdmin) {
        throw new Error('❌ Solo administradores pueden aprobar en esta etapa');
      }
      campoActualizar = {
        confirmacion2: 1,
        usuarioconfirma2: usuarioNombre,
        usuariomodificacion: usuarioNombre,
        fechamodificacion: new Date()
      };
      mensaje = '✅ Confirmación administrativa 1 registrada correctamente';
      console.log('📝 Datos a actualizar:', campoActualizar);

    } 
    // ✅ ETAPA 3: Otro admin aprueba
    else if (referido.confirmacion3 === 0 && referido.confirmacion2 === 1) {
      console.log('📍 Procesando ETAPA 3...');
      if (!esAdmin) {
        throw new Error('❌ Solo administradores pueden aprobar en esta etapa');
      }
      if (referido.usuarioconfirma2 === usuarioNombre) {
        throw new Error('❌ No puede aprobar dos veces el mismo referido');
      }
      campoActualizar = {
        confirmacion3: 1,
        usuarioconfirma3: usuarioNombre,
        usuariomodificacion: usuarioNombre,
        fechamodificacion: new Date()
      };
      mensaje = '✅ Confirmación administrativa 2 registrada correctamente';
      console.log('📝 Datos a actualizar:', campoActualizar);

    } 
    // ✅ ETAPA 4: Usuario de la clínica destino
  else if (referido.confirmacion4 === 0 && referido.confirmacion3 === 1) {
    console.log('📍 Procesando ETAPA 4...');
    if (!referido.rutadocumentofinal) {
      throw new Error('❌ Debe subir el documento final antes de aprobar');
    }

    if (usuarioConRol.fkclinica !== referido.fkclinica) {
      throw new Error('❌ Solo usuarios asignados a la clínica destino pueden aprobar esta etapa');
    }
    campoActualizar = {
      confirmacion4: 1,
      usuarioconfirma4: usuarioNombre,
      usuariomodificacion: usuarioNombre,
      fechamodificacion: new Date()
    };
    mensaje = '✅ Referido completado exitosamente. Paciente transferido a nueva clínica.';
    console.log('📝 Datos a actualizar:', campoActualizar);

  } else {
    throw new Error('❌ No se puede aprobar en esta etapa');
  }

  if (comentarioAdicional) {
    const comentarioActual = referido.comentario || '';
    campoActualizar.comentario = comentarioActual 
      ? `${comentarioActual}\n---\n${usuarioNombre}: ${comentarioAdicional}`
      : comentarioAdicional;
  }

  console.log('💾 Actualizando referido en BD...');
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
      }
    }
  });

  // ✅ NUEVO: Si se completó el referido (confirmacion4), actualizar la clínica del paciente
  if (referidoActualizado.confirmacion4 === 1) {
    console.log('🏥 Transfiriendo paciente a nueva clínica...');
    await prisma.paciente.update({
      where: { idpaciente: referidoActualizado.fkpaciente },
      data: {
        fkclinica: referidoActualizado.fkclinica,
        usuariomodificacion: usuarioNombre,
        fechamodificacion: new Date()
      }
    });
    console.log('✅ Paciente transferido exitosamente a clínica:', referidoActualizado.clinica.nombreclinica);
  }

  console.log('✅ Referido actualizado exitosamente');
  return {
    referido: referidoActualizado,
    mensaje
  };

  } catch (error) {
    console.error('💥 ERROR en confirmarReferido service:', error);
    throw error;
  }
},

  // Actualizar referido
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

    const usuarioConRol = await prisma.usuario.findUnique({
      where: { idusuario: usuario.idusuario },
      include: { rol: true }
    });

    const esAdmin = usuarioConRol.fkrol === 1;
    const esCreador = referido.fkusuario === usuario.idusuario;

    // ✅ FILTRAR CAMPOS UNDEFINED ANTES DE VALIDAR
    const datosLimpios = Object.fromEntries(
      Object.entries(datos).filter(([_, valor]) => valor !== undefined)
    );

    console.log('🧹 Datos limpios:', datosLimpios);
    console.log('🧹 Keys limpias:', Object.keys(datosLimpios));

    // Verificar si solo está actualizando documento final en etapa 4
    const esEtapa4 = referido.confirmacion3 === 1 && referido.confirmacion4 === 0;
    const soloActualizaDocumentoFinal = datosLimpios.rutadocumentofinal !== undefined && 
                                       Object.keys(datosLimpios).length === 1;

    console.log('✅ esEtapa4:', esEtapa4);
    console.log('✅ soloActualizaDocumentoFinal:', soloActualizaDocumentoFinal);

    // Validar permisos según el tipo de actualización
    if (esEtapa4 && soloActualizaDocumentoFinal) {
      console.log('🎯 Permitiendo actualización de documento final en etapa 4');
      
      // En etapa 4, solo usuarios de la clínica destino pueden subir documento final
      const perteneceClinicaDestino = usuarioConRol.fkclinica === referido.fkclinica;
      
      if (!perteneceClinicaDestino && !esAdmin) {
        throw new Error('❌ Solo usuarios de la clínica destino pueden subir el documento final');
      }
    } else {
      console.log('🔒 Validando permisos normales de actualización');
      
      // Para otras actualizaciones, validar permisos normales
      if (!esCreador && !esAdmin) {
        throw new Error('❌ Solo el creador o un administrador pueden modificar este referido');
      }

      if (referido.confirmacion4 === 1) {
        throw new Error('❌ No se puede modificar un referido completado');
      }
    }

    // Preparar datos para actualizar (usando datos originales, no limpios)
    const datosActualizar = {
      usuariomodificacion: usuario.usuario,
      fechamodificacion: new Date()
    };

    if (datos.fkclinica !== undefined) datosActualizar.fkclinica = datos.fkclinica;
    if (datos.comentario !== undefined) datosActualizar.comentario = datos.comentario;
    if (datos.rutadocumentoinicial !== undefined) datosActualizar.rutadocumentoinicial = datos.rutadocumentoinicial;
    if (datos.rutadocumentofinal !== undefined) datosActualizar.rutadocumentofinal = datos.rutadocumentofinal;

    console.log('💾 Actualizando con:', datosActualizar);

    const referidoActualizado = await prisma.detallereferirpaciente.update({
      where: { idrefpaciente: id },
      data: datosActualizar,
      include: {
        paciente: true,
        clinica: true,
        usuario: {
          select: { nombres: true, apellidos: true }
        }
      }
    });

    console.log('✅ Referido actualizado exitosamente');
    return referidoActualizado;

  } catch (error) {
    console.error('Error en actualizarReferido service:', error);
    throw error;
  }
},

  // Cambiar estado
  async cambiarEstado(id, nuevoEstado, usuario) {
    try {
      const referido = await prisma.detallereferirpaciente.findUnique({
        where: { idrefpaciente: id }
      });

      if (!referido) {
        throw new Error('Referido no encontrado');
      }

      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol?.rol?.nombre?.toLowerCase().includes('admin');

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