
const jwt = require('jsonwebtoken');

const generarToken = (payload) => {
    return jwt.sign(
        {
            // Si el payload ya trae su propio timestamp (ej. authService.login,
            // para que coincida exactamente con el que registra sessionTracker),
            // se respeta; si no, se genera uno aquí (comportamiento anterior).
            timestamp: Date.now(),
            ...payload
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );
};

const verificarToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch(error) {
        throw new Error('Token inválido o expirado');
    }
};

module.exports = {
    generarToken,
    verificarToken
};