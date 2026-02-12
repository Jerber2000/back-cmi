
const { prisma } = require('../config/prisma');
const inventarioMedicoService = require('./inventarioMedicoService');

class SalidasInventarioService {
  
  async listarTodas() {
    try {
      const salidas = await prisma.salidasinventario.findMany({
        include: {
          medicamento: true, 
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

  async obtenerPorMedicamento(idmedicina) {
    try {
      
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

  async crear(data) {
    try {
      await inventarioMedicoService.validarDisponibilidad(
        data.fkmedicina, 
        data.cantidad
      );

      const medicamento = await inventarioMedicoService.obtenerPorId(data.fkmedicina);
      const nuevasUnidades = medicamento.unidades - data.cantidad;

      const resultado = await prisma.$transaction(async (tx) => {
        
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

  async anular(id, usuarioModificacion) {
    try {
      
      const salida = await this.obtenerPorId(id);
      
      if (salida.estado === 0) {
        throw new Error('La salida ya está anulada');
      }
      
      const medicamento = await inventarioMedicoService.obtenerPorId(salida.fkmedicina);
      const nuevasUnidades = medicamento.unidades + salida.cantidad;

      const resultado = await prisma.$transaction(async (tx) => {
        
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