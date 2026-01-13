const rateLimit = require('express-rate-limit');

/**
 * Rate limiter para recuperación de contraseña
 * - Permite 3 intentos cada 15 minutos
 * - Se resetea automáticamente después del tiempo de ventana
 * - Muestra tiempo restante en el mensaje de error
 */
const ResetearClaveLimiter = rateLimit({
  // Ventana de tiempo: 15 minutos
  windowMs: 15 * 60 * 1000,
  
  // Máximo de intentos permitidos en la ventana
  max: 3,
  
  // Headers estándar para informar al cliente
  standardHeaders: true,
  legacyHeaders: false,
  
  // Personalizar el mensaje con tiempo restante
  handler: (req, res) => {
    const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000 / 60);
    
    res.status(429).json({
      success: false,
      message: `Has excedido el límite de intentos de recuperación de contraseña (${req.rateLimit.limit} intentos cada 15 minutos).`,
      detalles: `Por favor espera aproximadamente ${retryAfter} minuto${retryAfter !== 1 ? 's' : ''} antes de intentar nuevamente.`,
      intentosRestantes: 0,
      tiempoEspera: `${retryAfter} minuto${retryAfter !== 1 ? 's' : ''}`
    });
  }
});

module.exports = ResetearClaveLimiter;