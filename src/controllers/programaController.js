const programaService = require('../services/programaService');

exports.getAll = async (req, res) => {
  try {
    const programas = await programaService.getAllProgramas();
    res.json({ success: true, data: programas });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al obtener programas', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { nombre } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, message: 'El nombre del programa es requerido' });
    }
    const programa = await programaService.createPrograma({ nombre });
    res.status(201).json({ success: true, data: programa, message: 'Programa creado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al crear programa', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, message: 'El nombre del programa es requerido' });
    }
    const programa = await programaService.updatePrograma(id, { nombre });
    res.json({ success: true, data: programa, message: 'Programa actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al actualizar programa', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await programaService.deletePrograma(id);
    res.json({ success: true, message: 'Programa eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error al eliminar programa', error: error.message });
  }
};
