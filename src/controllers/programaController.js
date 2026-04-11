const programaService = require('../services/programaService');

exports.getAll = async (req, res) => {
  try {
    const programas = await programaService.getAllProgramas();
    res.json({ success: true, data: programas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener programas', error: error.message });
  }
};
