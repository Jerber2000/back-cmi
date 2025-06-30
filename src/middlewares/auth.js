//se importa la funcion de vericar token
const { verificarToken } = require('../utils/jwt')

const validarToken = (req, res, next) => {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.startsWith('Bearer ')
        ?authHeader.slice(7)
        :null;

    if(!token){
        return res.status(401).json({
            success: false,
            message: 'Token de acceso requerido. Formato: "Authorization: Bearer <token>"'
        });
    }

    try{
        const decoded = verificarToken(token);
        req.usuario = decoded;
        next(); 
    }catch(error){
        return res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
  validarToken
};