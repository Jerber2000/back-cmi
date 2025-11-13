// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// ========================
// MIDDLEWARES GLOBALES
// ========================

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'], 
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined'));

// ========================
// 🔧 MIDDLEWARE PARA JSON
// ========================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========================
// RUTAS
// ========================

const authRoutes = require('./routes/authRoutes');
const usuarioRoute = require('./routes/usuarioRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');
const archivoRoutes = require('./routes/archivoRoutes');
const { ServeFileController } = require('./controllers/serveFileController');
const serveFileController = new ServeFileController();
const expedienteRoutes = require('./routes/expedienteRoutes'); 
const historialRoutes = require('./routes/historialMedico');
const agendaRoutes = require('./routes/agendaRoutes');
const referirRoutes = require('./routes/referirRoutes'); 
const inventarioMedico = require('./routes/inventariomedicoRoutes'); 
const reporteriaRoutes = require('./routes/reporteriaRoutes');
const documentoRoutes = require('./routes/documentoRoutes');
const salidasInventarioRoutes = require('./routes/salidasInventarioRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/usuario', usuarioRoute);
app.use('/api/archivo', archivoRoutes);
app.get('/api/files/:filename', (req, res) => serveFileController.serveFile(req, res));
app.get('/api/files/check/:filename', (req, res) => serveFileController.verificarArchivo(req, res));
app.use('/api/expedientes', expedienteRoutes); 
app.use('/api/historial', historialRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/referir', referirRoutes);
app.use('/api/inventario', inventarioMedico);
app.use('/api/salidas', salidasInventarioRoutes);
app.use('/api/reporteria', reporteriaRoutes);
app.use('/api/documentos', documentoRoutes);  

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenido a la API de CMI',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        verificar: 'GET /api/auth/verificar'
      },
      pacientes: {
        listar: 'GET /api/pacientes',
        crear: 'POST /api/pacientes',
        obtener: 'GET /api/pacientes/:id',
        actualizar: 'PUT /api/pacientes/:id',
        eliminar: 'DELETE /api/pacientes/:id'
      },
      expedientes: { 
        listar: 'GET /api/expedientes',
        crear: 'POST /api/expedientes',
        obtener: 'GET /api/expedientes/:id',
        actualizar: 'PUT /api/expedientes/:id',
        eliminar: 'DELETE /api/expedientes/:id',
        disponibles: 'GET /api/expedientes/disponibles',
        generarNumero: 'GET /api/expedientes/generar-numero',
        estadisticas: 'GET /api/expedientes/estadisticas'
      },
      archivos: {
        subir: 'POST /api/files/upload',
        ver: 'GET /api/files/view/:fileName',
        eliminar: 'DELETE /api/files/delete/:pacienteId/:tipo',
        paciente: 'GET /api/files/patient/:pacienteId'
      },
      historial: {
        obtener: 'GET /api/historial/paciente/:idpaciente',
        crear: 'POST /api/historial/crear-sesion',
        actualizar: 'PUT /api/historial/actualizar-sesion/:idhistorial',
        subirArchivos: 'POST /api/historial/subir-archivos/:idpaciente'
      },
      referir: {
        crear: 'POST /api/referir',
        listar: 'GET /api/referir?tipo=pendientes|enviados|recibidos|completados',
        detalle: 'GET /api/referir/:id',
        confirmar: 'PUT /api/referir/:id/confirmar',
        actualizar: 'PUT /api/referir/:id',
        cambiarEstado: 'PUT /api/referir/:id/estado',
        historialPaciente: 'GET /api/referir/paciente/:idPaciente'
      },
      inventario: {
        listar: 'GET /api/inventario',
        obtener: 'GET /api/inventario/:id',
        crear: 'POST /api/inventario',
        actualizar: 'PUT /api/inventario/:id',
        cambiarEstado: 'PUT /api/inventario/:id/estado'
      },
      reporteria: {
        dashboard: 'GET /api/reporteria/dashboard',
        pacientes: 'GET /api/reporteria/pacientes',
        consultas: 'GET /api/reporteria/consultas',
        inventario: 'GET /api/reporteria/inventario',
        agenda: 'GET /api/reporteria/agenda',
        referencias: 'GET /api/reporteria/referencias',
        generarPDF: 'POST /api/reporteria/generar-pdf',
        exportarExcel: 'POST /api/reporteria/exportar-excel'
      },
      documentos: {
        listar: 'GET /api/documentos',
        crear: 'POST /api/documentos',
        obtener: 'GET /api/documentos/:id',
        actualizar: 'PUT /api/documentos/:id',
        eliminar: 'DELETE /api/documentos/:id',
        cambiarEstado: 'PATCH /api/documentos/:id/estado'
      },
      salidas: {
        listar: 'GET /api/inventario/salidas',
        obtener: 'GET /api/inventario/salidas/:id',
        crear: 'POST /api/inventario/salidas',
        anular: 'PUT /api/inventario/salidas/:id/anular',
        historialMedicamento: 'GET /api/salidas/medicamento/:idmedicina',
        estadisticas: 'GET /api/inventario/salidas/estadisticas'
      }
    }
  });
});

// ========================
// MANEJO DE ERRORES
// ========================

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Ruta ${req.method} ${req.originalUrl} no encontrada`
  });
});

// 🔧 MIDDLEWARE MEJORADO PARA MANEJO DE ERRORES
app.use((error, req, res, next) => {
  console.error('❌ Error no manejado:', error);
  
  // 🆕 Manejo especial para errores de parsing JSON
  if (error.type === 'entity.parse.failed') {
    console.error('❌ Error de parsing JSON en ruta:', req.path);
    return res.status(400).json({
      success: false,
      message: 'Error al procesar los datos enviados. Verifique el formato.'
    });
  }
  
  // Errores de multer (archivos)
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo es muy grande. Máximo 5MB permitido.'
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Campo de archivo inesperado.'
    });
  }
  
  if (error.code === 'ENOENT') {
    return res.status(404).json({
      success: false,
      message: 'Archivo no encontrado.'
    });
  }
  
  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { 
      error: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method
    })
  });
});

// ========================
// INICIALIZAR SERVIDOR
// ========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`📁 Archivos genéricos: /api/archivo`);
  console.log(`🔧 Sistema de archivos configurado correctamente`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

module.exports = app;