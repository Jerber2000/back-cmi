// src/middlewares/validarReferido.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

const validarReferido = {

  // Validar datos para crear referido
  validarCreacion: async (req, res, next) => {
    try {
      const {
        fkpaciente,
        fkexpediente,
        fkclinica
        // ❌ YA NO fkusuariodestino
      } = req.body;

      const errores = [];

      // Validar campos requeridos
      if (!fkpaciente) errores.push('fkpaciente es requerido');
      if (!fkexpediente) errores.push('fkexpediente es requerido');
      if (!fkclinica) errores.push('fkclinica es requerido');

      // Validar tipos de datos
      if (fkpaciente && !Number.isInteger(Number(fkpaciente))) {
        errores.push('fkpaciente debe ser un número entero');
      }
      if (fkexpediente && !Number.isInteger(Number(fkexpediente))) {
        errores.push('fkexpediente debe ser un número entero');
      }
      if (fkclinica && !Number.isInteger(Number(fkclinica))) {
        errores.push('fkclinica debe ser un número entero');
      }

      if (errores.length > 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Errores de validación',
          errores
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarCreacion:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error en validación',
        error: error.message
      });
    }
  },

  // Validar que el referido existe y está activo
  validarExistencia: async (req, res, next) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ID de referido inválido'
        });
      }

      const referido = await prisma.detallereferirpaciente.findFirst({
        where: {
          idrefpaciente: Number(id),
          estado: 1
        }
      });

      if (!referido) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Referido no encontrado o inactivo'
        });
      }

      // Adjuntar referido al request para usarlo en el controller
      req.referido = referido;
      next();

    } catch (error) {
      console.error('Error en validarExistencia:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al validar existencia del referido',
        error: error.message
      });
    }
  },

  // Validar permisos para ver el referido
  validarPermisoVer: async (req, res, next) => {
    try {
      const referido = req.referido;
      const usuario = req.usuario;

      if (!referido) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Referido no encontrado'
        });
      }

      // ✅ Buscar rol del usuario
      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol.rol.nombre.toLowerCase().includes('admin');
      const esCreador = referido.fkusuario === usuario.idusuario;
      const esDeClinicaDestino = usuarioConRol.fkclinica === referido.fkclinica;

      if (!esAdmin && !esCreador && !esDeClinicaDestino) {  
        return res.status(403).json({
          ok: false,
          mensaje: 'No tiene permisos para ver este referido'
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarPermisoVer:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al validar permisos',
        error: error.message
      });
    }
  },

  // Validar permisos para confirmar
// src/middlewares/validarReferido.js
validarPermisoConfirmar: async (req, res, next) => {
  try {
    console.log('🔍 === INICIO validarPermisoConfirmar ===');
    console.log('📋 req.params:', req.params);
    console.log('👤 req.usuario:', req.usuario);
    
    const referido = req.referido;
    const usuario = req.usuario;

    console.log('📄 Referido cargado:', {
      idrefpaciente: referido?.idrefpaciente,
      confirmacion1: referido?.confirmacion1,
      confirmacion2: referido?.confirmacion2,
      confirmacion3: referido?.confirmacion3,
      confirmacion4: referido?.confirmacion4,
      usuarioconfirma2: referido?.usuarioconfirma2
    });

    if (!referido) {
      console.log('❌ No hay referido');
      return res.status(404).json({
        ok: false,
        mensaje: 'Referido no encontrado'
      });
    }

    if (referido.confirmacion4 === 1) {
      console.log('❌ Referido ya completado');
      return res.status(400).json({
        ok: false,
        mensaje: 'Este referido ya fue completado'
      });
    }

    console.log('🔍 Buscando usuario con rol...');
    const usuarioConRol = await prisma.usuario.findUnique({
      where: { idusuario: usuario.idusuario },
      include: { rol: true }
    });

    console.log('👤 Usuario con rol:', {
      idusuario: usuarioConRol?.idusuario,
      usuario: usuarioConRol?.usuario,
      fkrol: usuarioConRol?.fkrol,
      fkclinica: usuarioConRol?.fkclinica,
      rol: usuarioConRol?.rol
    });

    const esAdmin = usuarioConRol.fkrol === 1;
    console.log('🔑 Es Admin:', esAdmin);

    // ✅ ETAPA 2: Admin aprueba
    if (referido.confirmacion2 === 0 && referido.confirmacion1 === 1) {
      console.log('📍 ETAPA 2 - Validando...');
      if (!esAdmin) {
        console.log('❌ Usuario no es admin');
        return res.status(403).json({
          ok: false,
          mensaje: '❌ Solo administradores pueden aprobar en esta etapa (Confirmación 2)'
        });
      }
      console.log('✅ Usuario puede confirmar en ETAPA 2');
      return next();
    } 
    // ✅ ETAPA 3: Otro admin aprueba
    else if (referido.confirmacion3 === 0 && referido.confirmacion2 === 1) {
      console.log('📍 ETAPA 3 - Validando...');
      if (!esAdmin) {
        console.log('❌ Usuario no es admin');
        return res.status(403).json({
          ok: false,
          mensaje: '❌ Solo administradores pueden aprobar en esta etapa (Confirmación 3)'
        });
      }
      console.log('🔍 Validando que no sea el mismo admin...');
      console.log('   usuarioconfirma2:', referido.usuarioconfirma2);
      console.log('   usuario.usuario:', usuario.usuario);
      
      if (referido.usuarioconfirma2 === usuario.usuario) {
        console.log('❌ Es el mismo admin que confirmó en etapa 2');
        return res.status(400).json({
          ok: false,
          mensaje: '❌ No puede aprobar dos veces el mismo referido'
        });
      }
      console.log('✅ Usuario puede confirmar en ETAPA 3');
      return next();
    } 
    // ✅ ETAPA 4: Usuario de la clínica destino
    else if (referido.confirmacion4 === 0 && referido.confirmacion3 === 1) {
      console.log('📍 ETAPA 4 - Validando...');
      console.log('   fkclinica usuario:', usuarioConRol.fkclinica);
      console.log('   fkclinica referido:', referido.fkclinica);
      
      if (usuarioConRol.fkclinica !== referido.fkclinica) {
        console.log('❌ Usuario no pertenece a la clínica destino');
        return res.status(403).json({
          ok: false,
          mensaje: '❌ Solo usuarios asignados a la clínica destino pueden aprobar esta etapa final'
        });
      }
      console.log('✅ Usuario puede confirmar en ETAPA 4');
      return next();
    } 
    else {
      console.log('❌ No cumple ninguna condición de confirmación');
      console.log('   Estado actual:', {
        confirmacion1: referido.confirmacion1,
        confirmacion2: referido.confirmacion2,
        confirmacion3: referido.confirmacion3,
        confirmacion4: referido.confirmacion4
      });
      return res.status(400).json({
        ok: false,
        mensaje: '❌ No se puede aprobar en esta etapa del referido'
      });
    }

  } catch (error) {
    console.error('💥 ERROR en validarPermisoConfirmar:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al validar permisos de confirmación',
      error: error.message
    });
  }
},

  // Validar permisos para actualizar
validarPermisoActualizar: async (req, res, next) => {
  try {
    const referido = req.referido;
    const usuario = req.usuario;

    if (!referido) {
      return res.status(404).json({
        ok: false,
        mensaje: 'Referido no encontrado'
      });
    }

    // No se puede modificar si está completado
    if (referido.confirmacion4 === 1) {
      return res.status(400).json({
        ok: false,
        mensaje: 'No se puede modificar un referido completado'
      });
    }

    // ✅ Buscar rol del usuario
    const usuarioConRol = await prisma.usuario.findUnique({
      where: { idusuario: usuario.idusuario },
      include: { rol: true }
    });

    const esAdmin = usuarioConRol.fkrol === 1;
    const esCreador = referido.fkusuario === usuario.idusuario;

    // ✅ NUEVO: Permitir subir documento final en etapa 4
    const esEtapa4 = referido.confirmacion3 === 1 && referido.confirmacion4 === 0;
    const soloActualizaDocumentoFinal = req.body.rutadocumentofinal !== undefined && 
                                       Object.keys(req.body).length === 1;
    
    if (esEtapa4 && soloActualizaDocumentoFinal) {
      // Verificar que el usuario pertenezca a la clínica destino
      if (usuarioConRol.fkclinica !== referido.fkclinica && !esAdmin) {
        return res.status(403).json({
          ok: false,
          mensaje: 'Solo usuarios de la clínica destino pueden subir el documento final'
        });
      }
      // ✅ Permitir la actualización del documento final
      return next();
    }

    // Para otras modificaciones, validar permisos normales
    if (!esAdmin && !esCreador) {
      return res.status(403).json({
        ok: false,
        mensaje: 'Solo el creador del referido o un administrador pueden modificarlo'
      });
    }

    next();

  } catch (error) {
    console.error('Error en validarPermisoActualizar:', error);
    return res.status(500).json({
      ok: false,
      mensaje: 'Error al validar permisos de actualización',
      error: error.message
    });
  }
},

  // Validar datos de actualización
validarDatosActualizacion: (req, res, next) => {
    try {
      const { fkclinica, comentario, rutadocumentoinicial, rutadocumentofinal } = req.body;

      // Al menos un campo debe venir
      if (!fkclinica && comentario === undefined && !rutadocumentoinicial && !rutadocumentofinal) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe proporcionar al menos un campo para actualizar'
        });
      }

      // Validar tipo si viene
      if (fkclinica && !Number.isInteger(Number(fkclinica))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'fkclinica debe ser un número entero'
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarDatosActualizacion:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error en validación de datos',
        error: error.message
      });
    }
  },

};

module.exports = validarReferido;