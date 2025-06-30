const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const validarLogin = require('../middlewares/validarLogin');
const { validarToken } = require('../middlewares/auth');

router.post('/login',
  validarLogin,
  authController.login
);

router.post('/logout',
  authController.logout
);

router.get('/verificar', 
  validarToken,
  (req, res) => {
    res.json({
      success: true,
      message: 'Token válido',
      usuario: req.usuario
    });
  }
);

module.exports = router;