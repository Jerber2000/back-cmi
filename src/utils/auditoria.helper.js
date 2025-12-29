// src/utils/auditoria.helper.js

const { auditoriaStorage } = require('./auditoria.storage');

async function conAuditoria(req, modulo, callback) {
  const { prisma } = require('../config/prisma');
  
  // Obtener IP real del usuario (incluso detrás de proxies)
  let ipAddress = 
    req.headers['x-forwarded-for']?.split(',')[0].trim() ||
    req.headers['x-real-ip'] ||
    req.headers['cf-connecting-ip'] ||
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    null;
  
  // Convertir ::1 a 127.0.0.1 en desarrollo
  if (ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1') {
    ipAddress = '127.0.0.1';
  }
  
  const contexto = {
    usuario_id: req.usuario?.idusuario || null,
    usuario_nombre: req.usuario?.usuario || 'sistema',
    ip_address: ipAddress,
    user_agent: req.get ? req.get('user-agent') : null,
    modulo: modulo
  };
  
  // 🔥 Ejecutar la transacción dentro del storage
  // AsyncLocalStorage automáticamente aísla el contexto por petición
  return await auditoriaStorage.run(contexto, async () => {
    return await prisma.$transaction(async (tx) => {
      return await callback(tx);
    });
  });
}

module.exports = { conAuditoria };