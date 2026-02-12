
const { AsyncLocalStorage } = require('async_hooks');

const auditoriaStorage = new AsyncLocalStorage();

module.exports = { auditoriaStorage };