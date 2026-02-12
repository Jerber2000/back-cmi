
const { CONFIGURACION_AUDITORIA, NivelAuditoria, CAMPOS_SENSIBLES } = require('../config/auditoria');

class AuditoriaUtils {
  
  static obtenerNivelAuditoria(tabla) {
    if (CONFIGURACION_AUDITORIA.CRITICO.includes(tabla.toLowerCase())) {
      return NivelAuditoria.CRITICO;
    }
    if (CONFIGURACION_AUDITORIA.IMPORTANTE.includes(tabla.toLowerCase())) {
      return NivelAuditoria.IMPORTANTE;
    }
    if (CONFIGURACION_AUDITORIA.NORMAL.includes(tabla.toLowerCase())) {
      return NivelAuditoria.NORMAL;
    }
    return NivelAuditoria.SIN_AUDITORIA;
  }
  
  static debeAuditar(tabla, accion) {
    const nivel = this.obtenerNivelAuditoria(tabla);
    
    if (nivel === NivelAuditoria.SIN_AUDITORIA) {
      return false;
    }
    
    if (nivel === NivelAuditoria.CRITICO) {
      return true;
    }
    
    if (nivel === NivelAuditoria.IMPORTANTE) {
      return ['create', 'update', 'delete', 'updateMany', 'deleteMany'].includes(accion);
    }
    
    if (nivel === NivelAuditoria.NORMAL) {
      return ['delete', 'deleteMany'].includes(accion);
    }
    
    return false;
  }
  
  static ofuscarDatosSensibles(datos) {
    if (!datos || typeof datos !== 'object') {
      return datos;
    }
    
    const datosOfuscados = { ...datos };
    
    for (const campo of CAMPOS_SENSIBLES) {
      if (campo in datosOfuscados) {
        datosOfuscados[campo] = '***OFUSCADO***';
      }
    }
    
    return datosOfuscados;
  }
  
  static detectarCambios(anterior, nuevo) {
    if (!anterior || !nuevo) return [];
    
    const camposModificados = [];
    
    for (const key in nuevo) {
      if (JSON.stringify(anterior[key]) !== JSON.stringify(nuevo[key])) {
        camposModificados.push(key);
      }
    }
    
    return camposModificados;
  }
  
  static generarDescripcion(tabla, accion, datos) {
    const accionTexto = {
      'create': 'creó',
      'update': 'actualizó',
      'delete': 'eliminó',
      'updateMany': 'actualizó múltiples',
      'deleteMany': 'eliminó múltiples'
    }[accion] || accion;
    
    const tablaTexto = tabla.replace(/_/g, ' ');
    
    if (datos && datos.nombre) {
      return `${accionTexto} ${tablaTexto}: ${datos.nombre}`;
    }
    if (datos && datos.id) {
      return `${accionTexto} ${tablaTexto} #${datos.id}`;
    }
    
    return `${accionTexto} ${tablaTexto}`;
  }
  
  static extraerRegistroId(params, result) {
    let id = null;
    
    const camposId = [
      'idpaciente', 'idusuario', 'iddocumento', 'idrefpaciente', 'idhistorial', 'idexpediente', 
      'idagenda', 'idagenda_recurrente', 'idmedicina', 'idsalida', 
      'idclinica'
    ];
    
    if (params.args && params.args.where) {
      for (const campo of camposId) {
        if (params.args.where[campo] !== undefined) {
          id = params.args.where[campo];
          break;
        }
      }
    }
    
    if (!id && params.args && params.args.data) {
      for (const campo of camposId) {
        if (params.args.data[campo] !== undefined) {
          id = params.args.data[campo];
          break;
        }
      }
    }
    
    if (!id && result) {
      for (const campo of camposId) {
        if (result[campo] !== undefined) {
          id = result[campo];
          break;
        }
      }
    }
    
    if (!id && Array.isArray(result) && result.length > 0) {
      for (const campo of camposId) {
        if (result[0][campo] !== undefined) {
          id = result[0][campo];
          break;
        }
      }
    }
    
    return id ? id.toString() : 'N/A';
  }
}

module.exports = AuditoriaUtils;