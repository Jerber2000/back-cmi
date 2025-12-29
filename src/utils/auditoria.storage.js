// src/utils/auditoria.storage.js

const { AsyncLocalStorage } = require('async_hooks');

// Crear storage para el contexto de auditoría
const auditoriaStorage = new AsyncLocalStorage();

module.exports = { auditoriaStorage };