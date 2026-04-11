const express = require('express');
const router = express.Router();
const programaController = require('../controllers/programaController');

router.get('/', programaController.getAll);

module.exports = router;
