// src/routes/inventariomedicoRoutes.js
const { Router } = require('express');
const inventarioMedicoController = require('../controllers/inventarioMedicoController');
const inventarioMiddleware = require('../middlewares/validationInventario');
const checkRole = require('../middlewares/checkRole');

const router = Router();

// GET - Listar todos
router.get('/', inventarioMedicoController.listarTodos);

// GET - Obtener por ID
router.get('/:id', 
  inventarioMiddleware.validarId,
  checkRole(1,5),
  inventarioMedicoController.obtenerPorId
);

// POST - Crear nuevo
router.post('/', 
  inventarioMiddleware.validarCrear,
  checkRole(1,5),
  inventarioMedicoController.crear
);

// PUT - Actualizar
router.put('/:id', 
  inventarioMiddleware.validarId,
  inventarioMiddleware.validarActualizar,
  checkRole(1,5),
  inventarioMedicoController.actualizar
);

// PATCH - Cambiar estado (activo/inactivo)
router.put('/:id/estado', 
  inventarioMiddleware.validarId,
  inventarioMiddleware.validarCambiarEstado,
  checkRole(1,5),
  inventarioMedicoController.cambiarEstado
);

module.exports = router;