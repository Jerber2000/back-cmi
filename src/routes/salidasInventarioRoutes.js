const { Router } = require('express');
const salidasInventarioController = require('../controllers/salidasInventarioController');
const salidasMiddleware = require('../middlewares/validacionSalidas');
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const { verificarPermiso } = require('../middlewares/checkPermiso');

const router = Router();
const auth = [autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave];
const perm = verificarPermiso('salida-inventario');

router.get('/estadisticas',           ...auth, perm, salidasInventarioController.obtenerEstadisticas);
router.get('/medicamento/:idmedicina',...auth, salidasMiddleware.validarIdMedicamento, perm, salidasInventarioController.obtenerPorMedicamento);
router.get('/',                       ...auth, perm, salidasInventarioController.listarTodas);
router.get('/:id',                    ...auth, salidasMiddleware.validarId, perm, salidasInventarioController.obtenerPorId);
router.post('/',                      ...auth, salidasMiddleware.validarCrear, perm, salidasInventarioController.crear);
router.put('/:id/anular',             ...auth, salidasMiddleware.validarId, salidasMiddleware.validarAnular, perm, salidasInventarioController.anular);

module.exports = router;
