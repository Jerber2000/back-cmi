
const { Router } = require('express');
const salidasInventarioController = require('../controllers/salidasInventarioController');
const salidasMiddleware = require('../middlewares/validacionSalidas');
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const checkRole = require('../middlewares/checkRole');

const router = Router();

router.get(
  '/estadisticas',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  checkRole(1,4,7,9),
  salidasInventarioController.obtenerEstadisticas
);

router.get(
  '/medicamento/:idmedicina',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  salidasMiddleware.validarIdMedicamento,
  checkRole(1,4,7,9),
  salidasInventarioController.obtenerPorMedicamento
);

router.get(
  '/',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  checkRole(1,4,7,9),
  salidasInventarioController.listarTodas
);

router.get(
  '/:id',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  salidasMiddleware.validarId,
  checkRole(1,4,7,9),
  salidasInventarioController.obtenerPorId
);

router.post(
  '/',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  salidasMiddleware.validarCrear,
  checkRole(1,4,7,9),
  salidasInventarioController.crear
);

router.put(
  '/:id/anular',
  autenticacion.validarToken,
  autenticacion.verificarUsuarioEnBD,
  validarCambioClave,
  salidasMiddleware.validarId,
  salidasMiddleware.validarAnular,
  checkRole(1,4,7,9),
  salidasInventarioController.anular
);

module.exports = router;