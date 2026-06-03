const { Router } = require('express');
const inventarioMedicoController = require('../controllers/inventarioMedicoController');
const inventarioMiddleware = require('../middlewares/validationInventario');
const autenticacion = require('../middlewares/auth');
const { validarCambioClave } = require('../middlewares/validarCambioClave');
const { verificarPermiso } = require('../middlewares/checkPermiso');

const router = Router();
const auth = [autenticacion.validarToken, autenticacion.verificarUsuarioEnBD, validarCambioClave];
const perm = verificarPermiso('inventario');

router.get('/',           ...auth, perm, inventarioMedicoController.listarTodos);
router.get('/:id',        ...auth, inventarioMiddleware.validarId, perm, inventarioMedicoController.obtenerPorId);
router.post('/',          ...auth, inventarioMiddleware.validarCrear, perm, inventarioMedicoController.crear);
router.put('/:id',        ...auth, inventarioMiddleware.validarId, inventarioMiddleware.validarActualizar, perm, inventarioMedicoController.actualizar);
router.put('/:id/estado', ...auth, inventarioMiddleware.validarId, inventarioMiddleware.validarCambiarEstado, perm, inventarioMedicoController.cambiarEstado);

module.exports = router;
