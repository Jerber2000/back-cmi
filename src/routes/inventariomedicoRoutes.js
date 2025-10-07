// src/routes/inventariomedicoRoutes.js
const { Router } = require('express');
const inventarioMedicoController = require('../controllers/inventarioMedicoController');
const inventarioMiddleware = require('../middlewares/validationInventario');

const router = Router();

// GET - Listar todos
router.get('/', inventarioMedicoController.listarTodos);

// GET - Obtener por ID
router.get('/:id', 
  inventarioMiddleware.validarId, 
  inventarioMedicoController.obtenerPorId
);

// POST - Crear nuevo
router.post('/', 
  inventarioMiddleware.validarCrear,
  inventarioMedicoController.crear
);

// PUT - Actualizar
router.put('/:id', 
  inventarioMiddleware.validarId,
  inventarioMiddleware.validarActualizar,
  inventarioMedicoController.actualizar
);

// PATCH - Cambiar estado (activo/inactivo)
router.put('/:id/estado', 
  inventarioMiddleware.validarId,
  inventarioMiddleware.validarCambiarEstado,
  inventarioMedicoController.cambiarEstado
);

module.exports = router;