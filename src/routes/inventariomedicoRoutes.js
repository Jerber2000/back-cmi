
const { Router } = require('express');
const inventarioMedicoController = require('../controllers/inventarioMedicoController');
const inventarioMiddleware = require('../middlewares/validationInventario');
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const checkRole = require('../middlewares/checkRole');

const router = Router();

router.get(
  '/',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  checkRole(1,4,7,9),
  inventarioMedicoController.listarTodos
);

router.put(
  '/:id/estado',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  inventarioMiddleware.validarId,
  inventarioMiddleware.validarCambiarEstado,
  checkRole(1,4,7,9),
  inventarioMedicoController.cambiarEstado
);

router.get(
  '/:id',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  inventarioMiddleware.validarId,
  checkRole(1,4,7,9),
  inventarioMedicoController.obtenerPorId
);

router.post(
  '/',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  inventarioMiddleware.validarCrear,
  checkRole(1,4,7,9),
  inventarioMedicoController.crear
);

router.put(
  '/:id',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  inventarioMiddleware.validarId,
  inventarioMiddleware.validarActualizar,
  checkRole(1,4,7,9),
  inventarioMedicoController.actualizar
);

module.exports = router;
