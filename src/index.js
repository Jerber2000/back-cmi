require('dotenv').config();

// ✅ AGREGAR - Importar Prisma
const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

// ✅ AGREGAR - Función de conexión a la base de datos
async function connectDB() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL con Prisma');
    
    // Test opcional: contar usuarios
    const userCount = await prisma.usuario.count();
    console.log(`📊 Usuarios en la base de datos: ${userCount}`);
    
    // Test opcional: contar pacientes
    const patientCount = await prisma.paciente.count();
    console.log(`👥 Pacientes en la base de datos: ${patientCount}`);
    
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    // No terminar el proceso en producción, solo mostrar el error
    if (process.env.NODE_ENV === 'development') {
      process.exit(1);
    }
  }
}

// ✅ AGREGAR - Ejecutar conexión
connectDB();

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
// En tu back-cmi/src/index.js
app.use(cors({
  origin: [
    'https://front-cmi-production.up.railway.app',
    'http://localhost:4200'
  ],
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Parsing de requests
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ AGREGAR - Middleware para hacer prisma disponible en las rutas
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// ========================
// RUTAS
// ========================

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const usuarioRoute = require('./routes/usuarioRoutes');
const pacienteRoutes = require('./routes/pacienteRoutes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/usuario', usuarioRoute);

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
        obtener: 'GET /api/pacientes/:id'
      },
      usuarios: {
        listar: 'GET /api/usuario',
        crear: 'POST /api/usuario'
      }
    },
    database: {
      status: 'connected',
      provider: 'PostgreSQL'
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

// Middleware global para manejo de errores
app.use((error, req, res, next) => {
  console.error('Error no manejado:', error);
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// ========================
// INICIALIZAR SERVIDOR
// ========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`🌍 Modo: ${process.env.NODE_ENV || 'development'}`);
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

// ✅ AGREGAR - Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Cerrando servidor...');
  await prisma.$disconnect();
  console.log('✅ Conexión a base de datos cerrada');
  process.exit(0);
});

// ✅ AGREGAR - Exportar prisma para uso en otros archivos
module.exports = { prisma };