// src/services/salidasInventarioService.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const inventarioMedicoService = require('./inventarioMedicoService');

class SalidasInventarioService {
  
  // Listar todas las salidas
  async listarTodas() {
    try {
      const salidas = await prisma.salidasinventario.findMany({
        include: {
          medicamento: true,  // ← Simplifica el include primero
          usuario: true
        },
        orderBy: {
          fechacreacion: 'desc'
        }
      });

      return salidas;
    } catch (error) {
      throw new Error(`Error al listar salidas: ${error.message}`);
    }
  }

  // Obtener salida por ID
  async obtenerPorId(id) {
    try {
      const salida = await prisma.salidasinventario.findUnique({
        where: { idsalida: parseInt(id) },
        include: {
          medicamento: {
            select: {
              idmedicina: true,
              nombre: true,
              codigoproducto: true,
              descripcion: true,
              unidades: true,
              precio: true
            }
          },
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

      if (!salida) {
        throw new Error('Salida no encontrada');
      }

      return salida;
    } catch (error) {
      throw new Error(`Error al obtener salida: ${error.message}`);
    }
  }

  // Obtener historial de salidas de un medicamento específico
  async obtenerPorMedicamento(idmedicina) {
    try {
      // Verificar que el medicamento existe
      await inventarioMedicoService.obtenerPorId(idmedicina);

      const salidas = await prisma.salidasinventario.findMany({
        where: { 
          fkmedicina: parseInt(idmedicina)
        },
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

      return salidas;
    } catch (error) {
      throw new Error(`Error al obtener historial de salidas: ${error.message}`);
    }
  }

  // Crear nueva salida (CON TRANSACCIÓN)
  async crear(data) {
    try {
      // 1. Validar que el medicamento existe y tiene suficiente stock
      await inventarioMedicoService.validarDisponibilidad(
        data.fkmedicina, 
        data.cantidad
      );

      // 2. Obtener información actual del medicamento
      const medicamento = await inventarioMedicoService.obtenerPorId(data.fkmedicina);
      const nuevasUnidades = medicamento.unidades - data.cantidad;

      // 3. Ejecutar creación de salida y actualización de inventario en TRANSACCIÓN
      const resultado = await prisma.$transaction(async (tx) => {
        // Crear registro de salida
        const nuevaSalida = await tx.salidasinventario.create({
          data: {
            fkmedicina: data.fkmedicina,
            fkusuario: data.fkusuario,
            cantidad: data.cantidad,
            motivo: data.motivo || null,
            destino: data.destino || null,
            observaciones: data.observaciones || null,
            fechasalida: data.fechasalida ? new Date(data.fechasalida) : new Date(),
            usuariocreacion: data.usuariocreacion,
            estado: 1
          },
          include: {
            medicamento: {
              select: {
                nombre: true,
                codigoproducto: true
              }
            },
            usuario: {
              select: {
                nombres: true,
                apellidos: true
              }
            }
          }
        });

        // Descontar unidades del inventario
        await tx.inventariomedico.update({
          where: { idmedicina: data.fkmedicina },
          data: {
            unidades: nuevasUnidades,
            usuariomodificacion: data.usuariocreacion,
            fechamodificacion: new Date()
          }
        });

        return nuevaSalida;
      });

      return {
        ...resultado,
        stockAnterior: medicamento.unidades,
        stockActual: nuevasUnidades,
        mensaje: `Salida registrada. Stock actualizado: ${nuevasUnidades} unidades`
      };

    } catch (error) {
      throw new Error(`Error al crear salida: ${error.message}`);
    }
  }

  // Anular una salida (CON TRANSACCIÓN)
  async anular(id, usuarioModificacion) {
    try {
      // 1. Obtener la salida
      const salida = await this.obtenerPorId(id);

      // 2. Validar que la salida esté activa
      if (salida.estado === 0) {
        throw new Error('La salida ya está anulada');
      }

      // 3. Obtener el medicamento actual
      const medicamento = await inventarioMedicoService.obtenerPorId(salida.fkmedicina);
      const nuevasUnidades = medicamento.unidades + salida.cantidad;

      // 4. Ejecutar anulación y devolución de unidades en TRANSACCIÓN
      const resultado = await prisma.$transaction(async (tx) => {
        // Anular la salida
        const salidaAnulada = await tx.salidasinventario.update({
          where: { idsalida: parseInt(id) },
          data: {
            estado: 0,
            usuariomodificacion: usuarioModificacion,
            fechamodificacion: new Date()
          },
          include: {
            medicamento: {
              select: {
                nombre: true,
                codigoproducto: true
              }
            }
          }
        });

        // Devolver unidades al inventario
        await tx.inventariomedico.update({
          where: { idmedicina: salida.fkmedicina },
          data: {
            unidades: nuevasUnidades,
            usuariomodificacion: usuarioModificacion,
            fechamodificacion: new Date()
          }
        });

        return salidaAnulada;
      });

      return {
        ...resultado,
        stockAnterior: medicamento.unidades,
        stockRestaurado: nuevasUnidades,
        unidadesDevueltas: salida.cantidad,
        mensaje: `Salida anulada. Se devolvieron ${salida.cantidad} unidades. Stock actual: ${nuevasUnidades}`
      };

    } catch (error) {
      throw new Error(`Error al anular salida: ${error.message}`);
    }
  }

  // Obtener estadísticas de salidas
  async obtenerEstadisticas() {
    try {
      const estadisticas = await prisma.salidasinventario.aggregate({
        where: { estado: 1 },
        _count: { idsalida: true },
        _sum: { cantidad: true }
      });

      const salidasPorMedicamento = await prisma.salidasinventario.groupBy({
        by: ['fkmedicina'],
        where: { estado: 1 },
        _sum: { cantidad: true },
        _count: { idsalida: true }
      });

      return {
        totalSalidas: estadisticas._count.idsalida || 0,
        totalUnidadesSalidas: estadisticas._sum.cantidad || 0,
        salidasPorMedicamento: salidasPorMedicamento
      };
    } catch (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
  }
}

module.exports = new SalidasInventarioService();