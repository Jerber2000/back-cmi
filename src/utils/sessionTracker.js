/**
 * Registro de sesiones activas por usuario, en memoria del proceso.
 *
 * No requiere tabla ni migración en la base de datos. Permite llevar el
 * conteo de cuántos dispositivos tienen sesión abierta por usuario, para
 * poder aplicar un límite distinto según el rol (ver authService.login).
 *
 * Nota: al reiniciar el proceso de Node (ej. tras un deploy con
 * `pm2 restart`) este registro se vacía. Esto NO es un problema de
 * seguridad: en el peor caso, justo después de un reinicio el sistema
 * "olvida" temporalmente quién tenía sesión activa, permitiendo un nuevo
 * login sin bloqueo hasta que cada quien vuelva a entrar.
 */

const sesionesPorUsuario = new Map(); // idusuario -> Array<{ timestamp: number }>

function parsearExpiracion(val = '24h') {
  const num = parseInt(val);
  if (isNaN(num)) return 60 * 60 * 1000;
  if (val.endsWith('s')) return num * 1000;
  if (val.endsWith('m')) return num * 60 * 1000;
  if (val.endsWith('h')) return num * 60 * 60 * 1000;
  if (val.endsWith('d')) return num * 24 * 60 * 60 * 1000;
  return num * 60 * 60 * 1000;
}

function limpiarExpiradas(idusuario) {
  const ttl = parsearExpiracion(process.env.JWT_EXPIRES_IN);
  const ahora = Date.now();
  const activas = (sesionesPorUsuario.get(idusuario) || [])
    .filter(sesion => (ahora - sesion.timestamp) < ttl);

  if (activas.length > 0) {
    sesionesPorUsuario.set(idusuario, activas);
  } else {
    sesionesPorUsuario.delete(idusuario);
  }

  return activas;
}

function contarActivas(idusuario) {
  return limpiarExpiradas(idusuario).length;
}

function registrarSesion(idusuario, timestamp) {
  const activas = limpiarExpiradas(idusuario);
  activas.push({ timestamp });
  sesionesPorUsuario.set(idusuario, activas);
}

function existeSesion(idusuario, timestamp) {
  if (!timestamp) return false;
  return limpiarExpiradas(idusuario).some(sesion => sesion.timestamp === timestamp);
}

function eliminarSesion(idusuario, timestamp) {
  const activas = limpiarExpiradas(idusuario).filter(sesion => sesion.timestamp !== timestamp);
  if (activas.length > 0) {
    sesionesPorUsuario.set(idusuario, activas);
  } else {
    sesionesPorUsuario.delete(idusuario);
  }
}

// Libera TODAS las sesiones de un usuario (ej. al resetear contraseña por
// "Olvidé mi contraseña", o si un admin lo desactiva).
function eliminarTodasLasSesiones(idusuario) {
  sesionesPorUsuario.delete(idusuario);
}

module.exports = {
  contarActivas,
  registrarSesion,
  existeSesion,
  eliminarSesion,
  eliminarTodasLasSesiones
};
