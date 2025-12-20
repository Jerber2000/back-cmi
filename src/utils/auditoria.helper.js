// src/utils/auditoria.helper.js

// Objeto para almacenar el contexto temporalmente
const auditoriaContexto = {
  actual: null
};

async function conAuditoria(req, modulo, callback) {
  const { prisma } = require('../config/prisma');
  
  const contexto = {
    usuario_id: req.usuario?.idusuario || null,
    usuario_nombre: req.usuario?.usuario || 'sistema',
    ip_address: req.ip || req.connection?.remoteAddress || null,
    user_agent: req.get ? req.get('user-agent') : null,
    modulo: modulo
  };
  
  // Guardar contexto
  auditoriaContexto.actual = contexto;
  
  try {
    const resultado = await prisma.$transaction(async (tx) => {
      return await callback(tx);
    });
    
    return resultado;
  } finally {
    // Limpiar contexto después de la transacción
    auditoriaContexto.actual = null;
  }
}

// Exportar tanto la función como el contenedor del contexto
module.exports = { conAuditoria, auditoriaContexto };