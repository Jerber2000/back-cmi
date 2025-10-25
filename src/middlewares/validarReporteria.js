// src/middlewares/validarReporteria.js

const validarReporteria = {

  // Validar filtros para reporte de pacientes
  validarFiltrosPacientes: (req, res, next) => {
    try {
      const { desde, hasta, genero, edadMin, edadMax, page, limit } = req.query;

      const errores = [];

      // Validar fechas si vienen
      if (desde && !isValidDate(desde)) {
        errores.push('Formato de fecha "desde" inválido. Use YYYY-MM-DD');
      }
      if (hasta && !isValidDate(hasta)) {
        errores.push('Formato de fecha "hasta" inválido. Use YYYY-MM-DD');
      }

      // Validar que "hasta" sea mayor que "desde"
      if (desde && hasta && new Date(desde) > new Date(hasta)) {
        errores.push('La fecha "desde" no puede ser mayor que "hasta"');
      }

      // Validar género
      if (genero && !['M', 'F'].includes(genero.toUpperCase())) {
        errores.push('El género debe ser M o F');
      }

      // Validar edades
      if (edadMin && (isNaN(edadMin) || parseInt(edadMin) < 0)) {
        errores.push('edadMin debe ser un número positivo');
      }
      if (edadMax && (isNaN(edadMax) || parseInt(edadMax) < 0)) {
        errores.push('edadMax debe ser un número positivo');
      }
      if (edadMin && edadMax && parseInt(edadMin) > parseInt(edadMax)) {
        errores.push('edadMin no puede ser mayor que edadMax');
      }

      // Validar paginación - LÍMITE AUMENTADO PARA REPORTERÍA
      if (page && (isNaN(page) || parseInt(page) < 1)) {
        errores.push('page debe ser un número mayor a 0');
      }
      if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 10000)) {
        errores.push('limit debe estar entre 1 y 10000');
      }

      if (errores.length > 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Errores de validación',
          errores
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarFiltrosPacientes:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error en validación de filtros',
        error: error.message
      });
    }
  },

  // Validar filtros para reporte de consultas
  validarFiltrosConsultas: (req, res, next) => {
    try {
      const { desde, hasta, medico, paciente, page, limit } = req.query;

      const errores = [];

      // Validar fechas
      if (desde && !isValidDate(desde)) {
        errores.push('Formato de fecha "desde" inválido. Use YYYY-MM-DD');
      }
      if (hasta && !isValidDate(hasta)) {
        errores.push('Formato de fecha "hasta" inválido. Use YYYY-MM-DD');
      }
      if (desde && hasta && new Date(desde) > new Date(hasta)) {
        errores.push('La fecha "desde" no puede ser mayor que "hasta"');
      }

      // Validar IDs
      if (medico && isNaN(medico)) {
        errores.push('El ID de médico debe ser un número');
      }
      if (paciente && isNaN(paciente)) {
        errores.push('El ID de paciente debe ser un número');
      }

      // Validar paginación - LÍMITE AUMENTADO
      if (page && (isNaN(page) || parseInt(page) < 1)) {
        errores.push('page debe ser un número mayor a 0');
      }
      if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 10000)) {
        errores.push('limit debe estar entre 1 y 10000');
      }

      if (errores.length > 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Errores de validación',
          errores
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarFiltrosConsultas:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error en validación de filtros',
        error: error.message
      });
    }
  },

  // Validar filtros para reporte de inventario
  validarFiltrosInventario: (req, res, next) => {
    try {
      const { estado, stockMinimo, proximosVencer, usuario, page, limit } = req.query;

      const errores = [];

      // Validar estado
      if (estado && !['activo', 'inactivo', 'todos'].includes(estado.toLowerCase())) {
        errores.push('estado debe ser: activo, inactivo o todos');
      }

      // Validar números
      if (stockMinimo && isNaN(stockMinimo)) {
        errores.push('stockMinimo debe ser un número');
      }
      if (proximosVencer && isNaN(proximosVencer)) {
        errores.push('proximosVencer debe ser un número de días');
      }
      if (usuario && isNaN(usuario)) {
        errores.push('El ID de usuario debe ser un número');
      }

      // Validar paginación - LÍMITE AUMENTADO
      if (page && (isNaN(page) || parseInt(page) < 1)) {
        errores.push('page debe ser un número mayor a 0');
      }
      if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 10000)) {
        errores.push('limit debe estar entre 1 y 10000');
      }

      if (errores.length > 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Errores de validación',
          errores
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarFiltrosInventario:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error en validación de filtros',
        error: error.message
      });
    }
  },

  // Validar filtros para reporte de agenda
  validarFiltrosAgenda: (req, res, next) => {
    try {
      const { desde, hasta, medico, mes, anio, transporte, page, limit } = req.query;

      const errores = [];

      // Validar fechas
      if (desde && !isValidDate(desde)) {
        errores.push('Formato de fecha "desde" inválido. Use YYYY-MM-DD');
      }
      if (hasta && !isValidDate(hasta)) {
        errores.push('Formato de fecha "hasta" inválido. Use YYYY-MM-DD');
      }
      if (desde && hasta && new Date(desde) > new Date(hasta)) {
        errores.push('La fecha "desde" no puede ser mayor que "hasta"');
      }

      // Validar mes y año
      if (mes && (isNaN(mes) || parseInt(mes) < 1 || parseInt(mes) > 12)) {
        errores.push('mes debe estar entre 1 y 12');
      }
      if (anio && (isNaN(anio) || parseInt(anio) < 2000 || parseInt(anio) > 2100)) {
        errores.push('anio debe estar entre 2000 y 2100');
      }

      // Validar IDs
      if (medico && isNaN(medico)) {
        errores.push('El ID de médico debe ser un número');
      }

      // Validar transporte
      if (transporte && !['0', '1'].includes(transporte)) {
        errores.push('transporte debe ser 0 o 1');
      }

      // Validar paginación - LÍMITE AUMENTADO
      if (page && (isNaN(page) || parseInt(page) < 1)) {
        errores.push('page debe ser un número mayor a 0');
      }
      if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 10000)) {
        errores.push('limit debe estar entre 1 y 10000');
      }

      if (errores.length > 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Errores de validación',
          errores
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarFiltrosAgenda:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error en validación de filtros',
        error: error.message
      });
    }
  },

  // Validar filtros para reporte de referencias
  validarFiltrosReferencias: (req, res, next) => {
    try {
      const { tipo, estado, clinica, medico, desde, hasta, page, limit } = req.query;

      const errores = [];

      // Validar tipo
      if (tipo && !['enviadas', 'recibidas', 'todos'].includes(tipo.toLowerCase())) {
        errores.push('tipo debe ser: enviadas, recibidas o todos');
      }

      // Validar estado
      if (estado && !['pendiente', 'proceso', 'completado', 'todos'].includes(estado.toLowerCase())) {
        errores.push('estado debe ser: pendiente, proceso, completado o todos');
      }

      // Validar fechas
      if (desde && !isValidDate(desde)) {
        errores.push('Formato de fecha "desde" inválido. Use YYYY-MM-DD');
      }
      if (hasta && !isValidDate(hasta)) {
        errores.push('Formato de fecha "hasta" inválido. Use YYYY-MM-DD');
      }
      if (desde && hasta && new Date(desde) > new Date(hasta)) {
        errores.push('La fecha "desde" no puede ser mayor que "hasta"');
      }

      // Validar IDs
      if (clinica && isNaN(clinica)) {
        errores.push('El ID de clínica debe ser un número');
      }
      if (medico && isNaN(medico)) {
        errores.push('El ID de médico debe ser un número');
      }

      // Validar paginación - LÍMITE AUMENTADO
      if (page && (isNaN(page) || parseInt(page) < 1)) {
        errores.push('page debe ser un número mayor a 0');
      }
      if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 10000)) {
        errores.push('limit debe estar entre 1 y 10000');
      }

      if (errores.length > 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Errores de validación',
          errores
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarFiltrosReferencias:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error en validación de filtros',
        error: error.message
      });
    }
  },

  validarFiltrosSalidas: (req, res, next) => {
    try {
      const { desde, hasta, estado, medicamento, usuario, page, limit } = req.query;

      const errores = [];

      // Validar fechas
      if (desde && !isValidDate(desde)) {
        errores.push('Formato de fecha "desde" inválido. Use YYYY-MM-DD');
      }
      if (hasta && !isValidDate(hasta)) {
        errores.push('Formato de fecha "hasta" inválido. Use YYYY-MM-DD');
      }
      if (desde && hasta && new Date(desde) > new Date(hasta)) {
        errores.push('La fecha "desde" no puede ser mayor que "hasta"');
      }

      // Validar estado
      if (estado && !['activas', 'anuladas', 'todas'].includes(estado.toLowerCase())) {
        errores.push('estado debe ser: activas, anuladas o todas');
      }

      // Validar IDs
      if (medicamento && isNaN(medicamento)) {
        errores.push('El ID de medicamento debe ser un número');
      }
      if (usuario && isNaN(usuario)) {
        errores.push('El ID de usuario debe ser un número');
      }

      // Validar paginación
      if (page && (isNaN(page) || parseInt(page) < 1)) {
        errores.push('page debe ser un número mayor a 0');
      }
      if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 10000)) {
        errores.push('limit debe estar entre 1 y 10000');
      }

      if (errores.length > 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Errores de validación',
          errores
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarFiltrosSalidas:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error en validación de filtros',
        error: error.message
      });
    }
  },

  // Validar generación de PDF
  validarGeneracionPDF: (req, res, next) => {
    try {
      const { tipoReporte, filtros } = req.body;

      const errores = [];

      if (!tipoReporte) {
        errores.push('tipoReporte es requerido');
      }

      const tiposValidos = ['pacientes', 'consultas', 'inventario', 'agenda', 'referencias', 'dashboard'];
      if (tipoReporte && !tiposValidos.includes(tipoReporte.toLowerCase())) {
        errores.push(`tipoReporte debe ser uno de: ${tiposValidos.join(', ')}`);
      }

      if (filtros && typeof filtros !== 'object') {
        errores.push('filtros debe ser un objeto');
      }

      if (errores.length > 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Errores de validación',
          errores
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarGeneracionPDF:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error en validación',
        error: error.message
      });
    }
  },

  // Validar exportación a Excel
  validarExportacionExcel: (req, res, next) => {
    try {
      const { tipoReporte, filtros } = req.body;

      const errores = [];

      if (!tipoReporte) {
        errores.push('tipoReporte es requerido');
      }

      const tiposValidos = ['pacientes', 'consultas', 'inventario', 'agenda', 'referencias'];
      if (tipoReporte && !tiposValidos.includes(tipoReporte.toLowerCase())) {
        errores.push(`tipoReporte debe ser uno de: ${tiposValidos.join(', ')}`);
      }

      if (filtros && typeof filtros !== 'object') {
        errores.push('filtros debe ser un objeto');
      }

      if (errores.length > 0) {
        return res.status(400).json({
          ok: false,
          mensaje: 'Errores de validación',
          errores
        });
      }

      next();

    } catch (error) {
      console.error('Error en validarExportacionExcel:', error);
      return res.status(500).json({
        ok: false,
        mensaje: 'Error en validación',
        error: error.message
      });
    }
  }

};

// Función auxiliar para validar fechas
function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

module.exports = validarReporteria;