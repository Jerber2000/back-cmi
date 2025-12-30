// src/middlewares/auditoria.middleware.js

const AuditoriaUtils = require('../utils/auditoria.utils');
const { AccionAuditoria, OPERACIONES_EXCLUIDAS, OPERACIONES_INTERNAS } = require('../config/auditoria');
const { auditoriaStorage } = require('../utils/auditoria.storage');  // 👈 Cambio

const crearAuditoriaMiddleware = () => {
  return async (params, next) => {
    const { model, action } = params;
    
    if (!model || OPERACIONES_EXCLUIDAS.includes(action)) {
      return next(params);
    }
    
    const tabla = model.toLowerCase();

    // Ignorar updates de last_login_timestamp en usuario
    if (tabla === 'usuario' && action === 'update') {
      const dataKeys = Object.keys(params.args.data || {});
      if (dataKeys.length === 1 && dataKeys[0] === 'last_login_timestamp') {
        return next(params);
      }
    }

    // Ignorar operaciones internas configuradas
    if (OPERACIONES_INTERNAS[tabla] && action === 'update' && params.args?.data) {
      const configuracionInterna = OPERACIONES_INTERNAS[tabla];
      
      if (configuracionInterna.includes('actualizarRutaDocumento')) {
        const camposModificados = Object.keys(params.args.data);
        const soloActualizaRuta = camposModificados.every(campo => 
          ['rutadocumento', 'usuariomodificacion', 'fechamodificacion'].includes(campo)
        );
        
        if (soloActualizaRuta) {
          console.log(`⏭️ Ignorando operación interna: ${tabla}.actualizarRutaDocumento`);
          return next(params);
        }
      }
    }
    
    if (!AuditoriaUtils.debeAuditar(tabla, action)) {
      return next(params);
    }
    
    try {
      // 🔥 Obtener contexto desde AsyncLocalStorage
      const contexto = auditoriaStorage.getStore() || {};
      
      // Capturar datos anteriores para UPDATE y DELETE
      let datosAnteriores = null;
      if (['update', 'delete'].includes(action) && params.args && params.args.where) {
        try {
          const { prisma } = require('../config/prisma');
          const whereClause = params.args.where;
          
          datosAnteriores = await prisma[model].findFirst({
            where: whereClause
          });
        } catch (error) {
          console.error('Error obteniendo datos anteriores:', error);
        }
      }
      
      // Ejecutar la operación original
      const result = await next(params);
      
      // Preparar datos para la bitácora
      const registroId = AuditoriaUtils.extraerRegistroId(params, result);
      const datosNuevos = result;
      const camposModificados = datosAnteriores && datosNuevos 
        ? AuditoriaUtils.detectarCambios(datosAnteriores, datosNuevos)
        : [];
      
      // Mapear acción
      const accionMap = {
        'create': AccionAuditoria.CREATE,
        'update': AccionAuditoria.UPDATE,
        'delete': AccionAuditoria.DELETE,
        'updateMany': AccionAuditoria.BULK_UPDATE,
        'deleteMany': AccionAuditoria.BULK_DELETE
      };
      
      const accionAuditoria = accionMap[action] || action.toUpperCase();
      
      // 🔥 El contexto se mantiene disponible gracias a AsyncLocalStorage
      setImmediate(async () => {
        try {
          const { prisma } = require('../config/prisma');
          
          await prisma.bitacora.create({
            data: {
              tabla,
              registro_id: registroId,
              accion: accionAuditoria,
              datos_anteriores: datosAnteriores ? AuditoriaUtils.ofuscarDatosSensibles(datosAnteriores) : null,
              datos_nuevos: datosNuevos ? AuditoriaUtils.ofuscarDatosSensibles(datosNuevos) : null,
              //campos_modificados: camposModificados,
              usuario_id: contexto.usuario_id || null,
              usuario_nombre: contexto.usuario_nombre || null,
              ip_address: contexto.ip_address || null,
              user_agent: contexto.user_agent || null,
              modulo: contexto.modulo || null,
              descripcion: AuditoriaUtils.generarDescripcion(tabla, action, datosNuevos)
            }
          });
        } catch (error) {
          console.error('❌ Error creando registro de auditoría:', error);
          console.error('Contexto disponible:', contexto);
          console.error('Datos:', { tabla, registroId, accionAuditoria });
        }
      });
      
      return result;
      
    } catch (error) {
      throw error;
    }
  };
};

module.exports = { crearAuditoriaMiddleware };