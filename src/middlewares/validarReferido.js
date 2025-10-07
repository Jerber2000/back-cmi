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
        fkclinica,
        fkusuariodestino
      } = req.body;

      const errores = [];

      // Validar campos requeridos
      if (!fkpaciente) errores.push('fkpaciente es requerido');
      if (!fkexpediente) errores.push('fkexpediente es requerido');
      if (!fkclinica) errores.push('fkclinica es requerido');
      if (!fkusuariodestino) errores.push('fkusuariodestino es requerido');

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
      if (fkusuariodestino && !Number.isInteger(Number(fkusuariodestino))) {
        errores.push('fkusuariodestino debe ser un número entero');
      }

      // Validar que el usuario destino no sea el mismo que el origen
      if (fkusuariodestino && req.usuario && 
          Number(fkusuariodestino) === req.usuario.idusuario) {
        errores.push('No puede referir un paciente a sí mismo');
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
      const esDestino = referido.fkusuariodestino === usuario.idusuario;

      if (!esAdmin && !esCreador && !esDestino) {
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
  validarPermisoConfirmar: async (req, res, next) => {
    try {
      const referido = req.referido;
      const usuario = req.usuario;

      if (!referido) {
        return res.status(404).json({
          ok: false,
          mensaje: 'Referido no encontrado'
        });
      }

      // Verificar que no esté completado
      if (referido.confirmacion4 === 1) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Este referido ya fue completado'
        });
      }

      // ✅ Buscar rol del usuario
      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol.rol.nombre.toLowerCase().includes('admin');

      // Determinar en qué etapa está
      if (referido.confirmacion2 === 0 && referido.confirmacion1 === 1) {
        // Etapa 2: requiere admin
        if (!esAdmin) {
          return res.status(403).json({
            ok: false,
            mensaje: 'Solo administradores pueden aprobar en esta etapa'
          });
        }
      } else if (referido.confirmacion3 === 0 && referido.confirmacion2 === 1) {
        // Etapa 3: requiere admin diferente
        if (!esAdmin) {
          return res.status(403).json({
            ok: false,
            mensaje: 'Solo administradores pueden aprobar en esta etapa'
          });
        }
        if (referido.usuarioconfirma2 === usuario.usuario) {
          return res.status(400).json({
            ok: false,
            mensaje: 'No puede aprobar dos veces el mismo referido'
          });
        }
      } else if (referido.confirmacion4 === 0 && referido.confirmacion3 === 1) {
        // Etapa 4: solo médico destino
        if (referido.fkusuariodestino !== usuario.idusuario) {
          return res.status(403).json({
            ok: false,
            mensaje: 'Solo el médico asignado puede aprobar esta etapa'
          });
        }
      } else {
        return res.status(400).json({
          ok: false,
          mensaje: 'No se puede aprobar en esta etapa'
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarPermisoConfirmar:', error);
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

      const esAdmin = usuarioConRol.rol.nombre.toLowerCase().includes('admin');
      const esCreador = referido.fkusuario === usuario.idusuario;

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
      const { fkclinica, fkusuariodestino, comentario } = req.body;

      // Al menos un campo debe venir
      if (!fkclinica && !fkusuariodestino && comentario === undefined) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Debe proporcionar al menos un campo para actualizar'
        });
      }

      // Validar tipos si vienen
      if (fkclinica && !Number.isInteger(Number(fkclinica))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'fkclinica debe ser un número entero'
        });
      }

      if (fkusuariodestino && !Number.isInteger(Number(fkusuariodestino))) {
        return res.status(400).json({
          ok: false,
          mensaje: 'fkusuariodestino debe ser un número entero'
        });
      }

      // Validar que no se asigne a sí mismo
      if (fkusuariodestino && req.usuario && 
          Number(fkusuariodestino) === req.usuario.idusuario) {
        return res.status(400).json({
          ok: false,
          mensaje: 'No puede asignarse el referido a sí mismo'
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
  }

};

module.exports = validarReferido;