const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

class DocumentoService {
  
  async listarDocumentos(filtros = {}) {
    try {
      const { estado = 1, busqueda } = filtros;
      
      const where = {
        estado: parseInt(estado)
      };

      if (busqueda) {
        where.nombredocumento = {
          contains: busqueda,
          mode: 'insensitive'
        };
      }

      const documentos = await prisma.detalledocumento.findMany({
        where,
        orderBy: {
          fechacreacion: 'desc'
        }
      });

      return documentos;
    } catch (error) {
      console.error('Error en DocumentoService.listarDocumentos:', error);
      throw new Error('Error al listar documentos');
    }
  }

  async obtenerDocumento(iddocumento) {
    try {
      const documento = await prisma.detalledocumento.findUnique({
        where: {
          iddocumento: parseInt(iddocumento)
        }
      });

      if (!documento) {
        throw new Error('Documento no encontrado');
      }

      return documento;
    } catch (error) {
      console.error('Error en DocumentoService.obtenerDocumento:', error);
      throw error;
    }
  }

  async crearDocumento(data) {
    try {
      const { nombredocumento, descripcion, usuariocreacion } = data;

      if (!nombredocumento || !usuariocreacion) {
        throw new Error('Nombre y usuario de creación son requeridos');
      }

      const nuevoDocumento = await prisma.detalledocumento.create({
        data: {
          nombredocumento: nombredocumento.trim(),
          descripcion: descripcion ? descripcion.trim() : null,
          rutadocumento: '',
          usuariocreacion,
          estado: 1
        }
      });

      return nuevoDocumento;
    } catch (error) {
      console.error('Error en DocumentoService.crearDocumento:', error);
      throw new Error(error.message || 'Error al crear documento');
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
        }
      });

      return documentoActualizado;
    } catch (error) {
      console.error('Error en DocumentoService.actualizarRutaDocumento:', error);
      throw new Error('Error al actualizar ruta del documento');
    }
  }

  async actualizarDocumento(iddocumento, data) {
    try {
      const { nombredocumento, descripcion, usuariomodificacion } = data;

      const documentoExiste = await this.obtenerDocumento(iddocumento);
      if (!documentoExiste) {
        throw new Error('Documento no encontrado');
      }

      const documentoActualizado = await prisma.detalledocumento.update({
        where: {
          iddocumento: parseInt(iddocumento)
        },
        data: {
          ...(nombredocumento && { nombredocumento: nombredocumento.trim() }),
          ...(descripcion !== undefined && { descripcion: descripcion ? descripcion.trim() : null }),
          usuariomodificacion,
          fechamodificacion: new Date()
        }
      });

      return documentoActualizado;
    } catch (error) {
      console.error('Error en DocumentoService.actualizarDocumento:', error);
      throw error;
    }
  }

  async eliminarDocumento(iddocumento, usuariomodificacion) {
    try {
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

      return documentoEliminado;
    } catch (error) {
      console.error('Error en DocumentoService.eliminarDocumento:', error);
      throw new Error('Error al eliminar documento');
    }
  }

  async cambiarEstado(iddocumento, nuevoEstado, usuariomodificacion) {
    try {
      const documentoActualizado = await prisma.detalledocumento.update({
        where: {
          iddocumento: parseInt(iddocumento)
        },
        data: {
          estado: parseInt(nuevoEstado),
          usuariomodificacion,
          fechamodificacion: new Date()
        }
      });

      return documentoActualizado;
    } catch (error) {
      console.error('Error en DocumentoService.cambiarEstado:', error);
      throw new Error('Error al cambiar estado del documento');
    }
  }
}

module.exports = new DocumentoService();