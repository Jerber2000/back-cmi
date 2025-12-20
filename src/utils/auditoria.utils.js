
const { CONFIGURACION_AUDITORIA, NivelAuditoria, CAMPOS_SENSIBLES } = require('../config/auditoria');

class AuditoriaUtils {
  
  // Determinar el nivel de auditoría de una tabla
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
  
  // Verificar si una acción debe auditarse
  static debeAuditar(tabla, accion) {
    const nivel = this.obtenerNivelAuditoria(tabla);
    
    if (nivel === NivelAuditoria.SIN_AUDITORIA) {
      return false;
    }
    
    // Crítico: auditar todo
    if (nivel === NivelAuditoria.CRITICO) {
      return true;
    }
    
    // Importante: auditar cambios y eliminaciones
    if (nivel === NivelAuditoria.IMPORTANTE) {
      return ['create', 'update', 'delete', 'updateMany', 'deleteMany'].includes(accion);
    }
    
    // Normal: solo eliminaciones
    if (nivel === NivelAuditoria.NORMAL) {
      return ['delete', 'deleteMany'].includes(accion);
    }
    
    return false;
  }
  
  // Ofuscar datos sensibles
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
  
  // Detectar campos modificados
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
  
  // Generar descripción legible
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
  
  // Extraer ID del registro
  static extraerRegistroId(params, result) {
    let id = null;
    
    // Lista de posibles nombres de campos ID
    const camposId = [
      'id', 'idpaciente', 'idusuario', 'idclinica', 'idexpediente', 
      'idcita', 'idagenda', 'idmedico', 'idconsulta', 'iddiagnostico',
      'idreceta', 'idinventario', 'idtransferencia', 'idreferencia'
    ];
    
    // 1. Intentar desde params.args.where
    if (params.args && params.args.where) {
      for (const campo of camposId) {
        if (params.args.where[campo] !== undefined) {
          id = params.args.where[campo];
          break;
        }
      }
    }
    
    // 2. Intentar desde params.args.data
    if (!id && params.args && params.args.data) {
      for (const campo of camposId) {
        if (params.args.data[campo] !== undefined) {
          id = params.args.data[campo];
          break;
        }
      }
    }
    
    // 3. Intentar desde result (cuando es create o update)
    if (!id && result) {
      for (const campo of camposId) {
        if (result[campo] !== undefined) {
          id = result[campo];
          break;
        }
      }
    }
    
    // 4. Si result es un array (updateMany, deleteMany), tomar el primero
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