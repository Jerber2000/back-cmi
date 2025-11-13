const { PrismaClient } = require('../generated/prisma');
const clinicaService = require('./clinicaService');

const prisma = new PrismaClient();

class DocumentoService {
  
  async listarDocumentos(filtros = {}) {
    try {
      const { estado = 1, busqueda, fkclinica } = filtros;
      
      const where = {
        estado: parseInt(estado)
      };

      if (busqueda) {
        where.nombredocumento = {
          contains: busqueda,
          mode: 'insensitive'
        };
      }

      if (fkclinica) {
        where.fkclinica = parseInt(fkclinica);
      }

      const documentos = await prisma.detalledocumento.findMany({
        where,
        select: {
          iddocumento: true,
          nombredocumento: true,
          descripcion: true,
          rutadocumento: true,
          fkclinica: true,
          usuariocreacion: true,
          fechacreacion: true,
          usuariomodificacion: true,
          fechamodificacion: true,
          estado: true,
          clinica: {
            select: {
              idclinica: true,
              nombreclinica: true
            }
          }
        },
        orderBy: {
          fechacreacion: 'desc'
        }
      });

      return {
        success: true,
        data: documentos
      };
    } catch (error) {
      console.error('Error en DocumentoService.listarDocumentos:', error.message);
      throw error;
    }
  }

  async obtenerDocumento(iddocumento) {
    try {
      const documento = await prisma.detalledocumento.findUnique({
        where: {
          iddocumento: parseInt(iddocumento)
        },
        select: {
          iddocumento: true,
          nombredocumento: true,
          descripcion: true,
          rutadocumento: true,
          fkclinica: true,
          usuariocreacion: true,
          fechacreacion: true,
          usuariomodificacion: true,
          fechamodificacion: true,
          estado: true,
          clinica: {
            select: {
              idclinica: true,
              nombreclinica: true
            }
          }
        }
      });

      if (!documento) {
        throw new Error('Documento no encontrado');
      }

      return {
        success: true,
        data: documento
      };
    } catch (error) {
      console.error('Error en DocumentoService.obtenerDocumento:', error.message);
      throw error;
    }
  }

  async crearDocumento(data) {
    try {
      const { nombredocumento, descripcion, fkclinica, usuariocreacion } = data;

      // Validar campos requeridos
      if (!nombredocumento || !usuariocreacion || !fkclinica) {
        return {
          success: false,
          message: 'Complete los campos requeridos: nombre, clínica y usuario de creación'
        };
      }

      // Validar que la clínica exista
      const clinicas = await clinicaService.consultarClinica();
      const clinicaExiste = clinicas.data.some(c => c.idclinica === parseInt(fkclinica));
      
      if (!clinicaExiste) {
        return {
          success: false,
          message: 'La clínica seleccionada no existe o está inactiva'
        };
      }

      const nuevoDocumento = await prisma.detalledocumento.create({
        data: {
          nombredocumento: nombredocumento.trim(),
          descripcion: descripcion ? descripcion.trim() : null,
          rutadocumento: '',
          fkclinica: parseInt(fkclinica),
          usuariocreacion,
          estado: 1
        },
        select: {
          iddocumento: true,
          nombredocumento: true,
          descripcion: true,
          rutadocumento: true,
          fkclinica: true,
          usuariocreacion: true,
          fechacreacion: true,
          estado: true,
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
        message: 'Documento creado exitosamente',
        data: nuevoDocumento
      };
    } catch (error) {
      console.error('Error en DocumentoService.crearDocumento:', error.message);
      throw error;
    }
  }

  async actualizarRutaDocumento(iddocumento, rutadocumento, usuariomodificacion) {
    try {
      const documentoActualizado = await prisma.detalledocumento.update({
        where: {
          iddocumento: parseInt(iddocumento)
        },
        data: {
          rutadocumento,
          usuariomodificacion,
          fechamodificacion: new Date()
        },
        select: {
          iddocumento: true,
          nombredocumento: true,
          descripcion: true,
          rutadocumento: true,
          fkclinica: true,
          usuariocreacion: true,
          fechacreacion: true,
          usuariomodificacion: true,
          fechamodificacion: true,
          estado: true,
          clinica: {
            select: {
              idclinica: true,
              nombreclinica: true
            }
          }
        }
      });

      return documentoActualizado;
    } catch (error) {
      console.error('Error en DocumentoService.actualizarRutaDocumento:', error.message);
      throw error;
    }
  }

  async actualizarDocumento(iddocumento, data) {
    try {
      const { nombredocumento, descripcion, fkclinica, usuariomodificacion } = data;

      // Validar que el documento existe
      const documentoExiste = await prisma.detalledocumento.findUnique({
        where: { iddocumento: parseInt(iddocumento) }
      });

      if (!documentoExiste) {
        return {
          success: false,
          message: 'El documento no existe'
        };
      }

      // Si se proporciona fkclinica, validar que exista
      if (fkclinica) {
        const clinicas = await clinicaService.consultarClinica();
        const clinicaExiste = clinicas.data.some(c => c.idclinica === parseInt(fkclinica));
        
        if (!clinicaExiste) {
          return {
            success: false,
            message: 'La clínica seleccionada no existe o está inactiva'
          };
        }
      }

      const documentoActualizado = await prisma.detalledocumento.update({
        where: {
          iddocumento: parseInt(iddocumento)
        },
        data: {
          ...(nombredocumento && { nombredocumento: nombredocumento.trim() }),
          ...(descripcion !== undefined && { descripcion: descripcion ? descripcion.trim() : null }),
          ...(fkclinica && { fkclinica: parseInt(fkclinica) }),
          usuariomodificacion,
          fechamodificacion: new Date()
        },
        select: {
          iddocumento: true,
          nombredocumento: true,
          descripcion: true,
          rutadocumento: true,
          fkclinica: true,
          usuariocreacion: true,
          fechacreacion: true,
          usuariomodificacion: true,
          fechamodificacion: true,
          estado: true,
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
        message: 'Documento actualizado exitosamente',
        data: documentoActualizado
      };
    } catch (error) {
      console.error('Error en DocumentoService.actualizarDocumento:', error.message);
      throw error;
    }
  }

  async eliminarDocumento(iddocumento, usuariomodificacion) {
    try {
      // Validar que el documento existe
      const documentoExiste = await prisma.detalledocumento.findUnique({
        where: { iddocumento: parseInt(iddocumento) }
      });

      if (!documentoExiste) {
        return {
          success: false,
          message: 'El documento no existe'
        };
      }

      // Verificar que no esté ya eliminado
      if (documentoExiste.estado === 0) {
        return {
          success: false,
          message: 'El documento ya está eliminado'
        };
      }

      const documentoEliminado = await prisma.detalledocumento.update({
        where: {
          iddocumento: parseInt(iddocumento)
        },
        data: {
          estado: 0,
          usuariomodificacion,
          fechamodificacion: new Date()
        }
      });

      return {
        success: true,
        message: 'Documento eliminado exitosamente'
      };
    } catch (error) {
      console.error('Error en DocumentoService.eliminarDocumento:', error.message);
      throw error;
    }
  }

  async cambiarEstado(iddocumento, nuevoEstado, usuariomodificacion) {
    try {
      // Validar que el documento existe
      const documentoExiste = await prisma.detalledocumento.findUnique({
        where: { iddocumento: parseInt(iddocumento) }
      });

      if (!documentoExiste) {
        return {
          success: false,
          message: 'El documento no existe'
        };
      }

      const documentoActualizado = await prisma.detalledocumento.update({
        where: {
          iddocumento: parseInt(iddocumento)
        },
        data: {
          estado: parseInt(nuevoEstado),
          usuariomodificacion,
          fechamodificacion: new Date()
        },
        select: {
          iddocumento: true,
          nombredocumento: true,
          descripcion: true,
          rutadocumento: true,
          fkclinica: true,
          usuariocreacion: true,
          fechacreacion: true,
          usuariomodificacion: true,
          fechamodificacion: true,
          estado: true,
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
        message: 'Estado actualizado exitosamente',
        data: documentoActualizado
      };
    } catch (error) {
      console.error('Error en DocumentoService.cambiarEstado:', error.message);
      throw error;
    }
  }
}

module.exports = new DocumentoService();