
const jwt = require('jsonwebtoken');

const generarToken = (payload) => {
    return jwt.sign(
        {
            ...payload,
            timestamp: Date.now()
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