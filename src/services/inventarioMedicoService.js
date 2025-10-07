// src/services/inventariomedicoService.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();

class InventarioMedicoService {
  // Listar TODOS los medicamentos (activos e inactivos)
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

  // Obtener un medicamento por ID
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

  // Crear un nuevo medicamento
  async crear(data) {
    try {
      const nuevoMedicamento = await prisma.inventariomedico.create({
        data: {
          fkusuario: data.fkusuario,
          nombre: data.nombre,
          descripcion: data.descripcion || null,
          unidades: data.unidades || 0,
          precio: data.precio || null,
          observaciones: data.observaciones || null,
          fechaingreso: data.fechaingreso ? new Date(data.fechaingreso) : null,
          fechaegreso: data.fechaegreso ? new Date(data.fechaegreso) : null,
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

  // Actualizar un medicamento
  async actualizar(id, data) {
    try {
      // Verificar que existe
      await this.obtenerPorId(id);

      const medicamentoActualizado = await prisma.inventariomedico.update({
        where: { idmedicina: parseInt(id) },
        data: {
          nombre: data.nombre,
          descripcion: data.descripcion,
          unidades: data.unidades,
          precio: data.precio,
          observaciones: data.observaciones,
          fechaingreso: data.fechaingreso ? new Date(data.fechaingreso) : undefined,
          fechaegreso: data.fechaegreso ? new Date(data.fechaegreso) : undefined,
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

  // Cambiar estado (activar/desactivar)
  async cambiarEstado(id, usuarioModificacion) {
    try {
      // Obtener el estado actual
      const medicamento = await this.obtenerPorId(id);
      const nuevoEstado = medicamento.estado === 1 ? 0 : 1;

      const medicamentoActualizado = await prisma.inventariomedico.update({
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
}

module.exports = new InventarioMedicoService();