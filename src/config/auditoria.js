
const NivelAuditoria = {
  CRITICO: 'CRITICO',
  IMPORTANTE: 'IMPORTANTE',
  NORMAL: 'NORMAL',
  SIN_AUDITORIA: 'SIN_AUDITORIA'
};

const AccionAuditoria = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  READ: 'READ',
  BULK_UPDATE: 'BULK_UPDATE',
  BULK_DELETE: 'BULK_DELETE'
};

const CONFIGURACION_AUDITORIA = {
  // Tablas críticas: auditar TODO
  CRITICO: [
    
  ],
  
  // Tablas importantes: auditar cambios y eliminaciones
  IMPORTANTE: [
    'usuario',
    'detalledocumento',
    'detallereferirpaciente',
    'detallehistorialclinico',
    'expediente'
  ],
  
  // Tablas normales: solo eliminaciones
  NORMAL: [
    'agenda',
    'agenda_recurrente',
    'inventariomedico',
    'salidasinventario',
    'paciente',
  ],
  
  // No auditar
  SIN_AUDITORIA: [
    'sesion',
    'token',
    'log',
    'auditoria_temp',
    'clinica',
    'rol'
  ]
};

const RETENER_DIAS = {
  CRITICO: 3650,      // 10 años
  IMPORTANTE: 1825,   // 5 años
  NORMAL: 365         // 1 año
};

// Campos sensibles que siempre deben ofuscarse en logs
const CAMPOS_SENSIBLES = [
  'password',
  'token',
  'api_key',
  'secret'
];

// Operaciones que NO deben auditarse
const OPERACIONES_EXCLUIDAS = [
  'findMany',
  'findFirst',
  'findUnique',
  'count',
  'aggregate'
];

const OPERACIONES_INTERNAS = {
  'detalledocumento': ['actualizarRutaDocumento'] // Solo actualiza la ruta del archivo
};

module.exports = {
  NivelAuditoria,
  AccionAuditoria,
  CONFIGURACION_AUDITORIA,
  RETENER_DIAS,
  CAMPOS_SENSIBLES,
  OPERACIONES_EXCLUIDAS,
  OPERACIONES_INTERNAS
};