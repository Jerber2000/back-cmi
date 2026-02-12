
const { prisma } = require('../config/prisma');

class InventarioMedicoService {
  
  async listarTodos() {
    try {
      const medicamentos = await prisma.inventariomedico.findMany({
        include: {
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
        }
      });
      return medicamentos;
    } catch (error) {
      throw new Error(`Error al listar medicamentos: ${error.message}`);
    }
  }

  async obtenerPorId(id) {
    try {
      const medicamento = await prisma.inventariomedico.findUnique({
        where: { idmedicina: parseInt(id) },
        include: {
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

      if (!medicamento) {
        throw new Error('Medicamento no encontrado');
      }

      return medicamento;
    } catch (error) {
      throw new Error(`Error al obtener medicamento: ${error.message}`);
    }
  }

  async crear(data) {
    try {
      
      if (data.codigoproducto) {
        const existeCodigo = await prisma.inventariomedico.findUnique({
          where: { codigoproducto: data.codigoproducto }
        });

        if (existeCodigo) {
          throw new Error('El código de producto ya está registrado');
        }
      }

      const nuevoMedicamento = await prisma.inventariomedico.create({
        data: {
          fkusuario: data.fkusuario,
          codigoproducto: data.codigoproducto || null,
          nombre: data.nombre,
          descripcion: data.descripcion || null,
          unidades: data.unidades || 0,
          precio: data.precio || null,
          observaciones: data.observaciones || null,
          fechaingreso: data.fechaingreso ? new Date(data.fechaingreso) : null,
          fechavencimiento: data.fechavencimiento ? new Date(data.fechavencimiento) : null,
          usuariocreacion: data.usuariocreacion,
          estado: 1
        },
        include: {
          usuario: {
            select: {
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      return nuevoMedicamento;
    } catch (error) {
      throw new Error(`Error al crear medicamento: ${error.message}`);
    }
  }

  async actualizar(id, data, tx = null) {
    try {
      const prismaClient = tx || prisma;
      
      await this.obtenerPorId(id);

      if (data.codigoproducto) {
        const existeCodigo = await prisma.inventariomedico.findFirst({
          where: {
            codigoproducto: data.codigoproducto,
            NOT: {
              idmedicina: parseInt(id)
            }
          }
        });

        if (existeCodigo) {
          throw new Error('El código de producto ya está registrado en otro medicamento');
        }
      }

      const medicamentoActualizado = await prismaClient.inventariomedico.update({
        where: { idmedicina: parseInt(id) },
        data: {
          codigoproducto: data.codigoproducto !== undefined ? data.codigoproducto : undefined,
          nombre: data.nombre,
          descripcion: data.descripcion,
          unidades: data.unidades,
          precio: data.precio,
          observaciones: data.observaciones,
          fechaingreso: data.fechaingreso ? new Date(data.fechaingreso) : undefined,
           fechavencimiento: data.fechavencimiento ? new Date(data.fechavencimiento) : undefined,
          usuariomodificacion: data.usuariomodificacion,
          fechamodificacion: new Date()
        },
        include: {
          usuario: {
            select: {
              nombres: true,
              apellidos: true
            }
          }
        }
      });

      return medicamentoActualizado;
    } catch (error) {
      throw new Error(`Error al actualizar medicamento: ${error.message}`);
    }
  }

  async cambiarEstado(id, usuarioModificacion, tx = null) {
    try {
      const prismaClient = tx || prisma;
      const medicamento = await this.obtenerPorId(id);
      const nuevoEstado = medicamento.estado === 1 ? 0 : 1;

      const medicamentoActualizado = await prismaClient.inventariomedico.update({
        where: { idmedicina: parseInt(id) },
        data: {
          estado: nuevoEstado,
          usuariomodificacion: usuarioModificacion,
          fechamodificacion: new Date()
        }
      });

      return {
        ...medicamentoActualizado,
        mensaje: nuevoEstado === 1 ? 'Medicamento activado' : 'Medicamento desactivado'
      };
    } catch (error) {
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }

  async validarDisponibilidad(idmedicina, cantidadSolicitada) {
    try {
      const medicamento = await this.obtenerPorId(idmedicina);
      
      if (medicamento.estado === 0) {
        throw new Error('El medicamento está inactivo');
      }

      if (medicamento.unidades < cantidadSolicitada) {
        throw new Error(`Stock insuficiente. Disponible: ${medicamento.unidades}, Solicitado: ${cantidadSolicitada}`);
      }

      return true;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new InventarioMedicoService();