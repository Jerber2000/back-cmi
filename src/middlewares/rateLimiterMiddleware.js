//const rateLimit = require('express-rate-limit');

//const ResetearClaveLimiter = rateLimit({
//    windowMs: 15 * 60 * 1000,
 //   max: 3,
  //  message: {
  //      error: 'Demasiados intentos de recuperación. Intenta en 15 minutos.'
  //  }
//});

//module.exports = ResetearClaveLimiter;

const rateLimit = require('express-rate-limit');

const ResetearClaveLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,   // 5 minutos (más razonable)
    max: 10,                   // 10 intentos (suficiente para testing)
    message: {
        success: false,
        message: 'Demasiados intentos de recuperación. Intenta en 5 minutos.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = ResetearClaveLimiter;