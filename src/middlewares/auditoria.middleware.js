
const AuditoriaUtils = require('../utils/auditoria.utils');
const { AccionAuditoria, OPERACIONES_EXCLUIDAS } = require('../config/auditoria');
const { auditoriaContexto } = require('../utils/auditoria.helper');

const crearAuditoriaMiddleware = () => {
  return async (params, next) => {
    const { model, action } = params;
    
    // Saltar si no hay modelo o es una operación excluida
    if (!model || OPERACIONES_EXCLUIDAS.includes(action)) {
      return next(params);
    }
    
    const tabla = model.toLowerCase();

    if (tabla === 'usuario' && action === 'update') {
      const dataKeys = Object.keys(params.args.data || {});
      // Si SOLO se actualiza last_timestamp, no auditar
      if (dataKeys.length === 1 && dataKeys[0] === 'last_login_timestamp') {
        return next(params);
      }
    }
    
    // Verificar si debe auditarse
    if (!AuditoriaUtils.debeAuditar(tabla, action)) {
      return next(params);
    }
    
    try {
      const contexto = auditoriaContexto.actual || {};
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
      
      // Obtener contexto de auditoría (si existe)
      // const contexto = params.contexto || {};
      
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
      
      // Crear registro de auditoría (sin esperar para no bloquear)
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
              campos_modificados: camposModificados,
              usuario_id: contexto.usuario_id || null,
              usuario_nombre: contexto.usuario_nombre || null,
              ip_address: contexto.ip_address || null,
              user_agent: contexto.user_agent || null,
              modulo: contexto.modulo || null,
              descripcion: AuditoriaUtils.generarDescripcion(tabla, action, datosNuevos),
              metadata: {
                operacion_original: action,
                timestamp: new Date().toISOString()
              }
            }
          });
        } catch (error) {
          console.error('Error creando registro de auditoría:', error);
          // No lanzar error para no afectar la operación principal
        }
      });
      
      return result;
      
    } catch (error) {
      // Si hay error en la operación principal, propagarlo
      throw error;
    }
  };
};

module.exports = { crearAuditoriaMiddleware };