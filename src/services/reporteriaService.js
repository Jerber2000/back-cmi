// src/services/reporteriaService.js
const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const PDFDocument = require('pdfkit');

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function calcularEdad(fechaNacimiento) {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
}

function truncarTexto(texto, maxLength) {
  if (!texto) return '';
  texto = String(texto);
  if (texto.length <= maxLength) return texto;
  return texto.substring(0, maxLength - 3) + '...';
}

// VALIDACIÓN DE FECHAS - CRÍTICO
function esFechaValida(fecha) {
  if (!fecha || fecha === '' || fecha === null || fecha === undefined) return false;
  const date = new Date(fecha);
  return date instanceof Date && !isNaN(date.getTime());
}

function generarPDFDashboard(doc, data) {
  doc.fontSize(14).font('Helvetica-Bold').text('Estadísticas Generales', { underline: true });
  doc.moveDown(0.5);
  
  doc.fontSize(10).font('Helvetica');
  
  doc.font('Helvetica-Bold').text('Pacientes:');
  doc.font('Helvetica')
    .text(`  Total: ${data.pacientes.total}`)
    .text(`  Activos: ${data.pacientes.activos}`)
    .text(`  Nuevos este mes: ${data.pacientes.nuevosMes}`);
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').text('Consultas:');
  doc.font('Helvetica').text(`  Total este mes: ${data.consultas.totalMes}`);
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').text('Inventario:');
  doc.font('Helvetica')
    .text(`  Total medicamentos: ${data.inventario.total}`)
    .text(`  Activos: ${data.inventario.activos}`)
    .text(`  Alertas stock bajo: ${data.inventario.alertasStockBajo}`)
    .text(`  Próximos a vencer: ${data.inventario.proximosVencer}`)
    .text(`  Valor total: Q${data.inventario.valorTotal.toFixed(2)}`);
  doc.moveDown(0.5);

  doc.font('Helvetica-Bold').text('Referencias:');
  doc.font('Helvetica')
    .text(`  Total: ${data.referencias.total}`)
    .text(`  Enviadas: ${data.referencias.enviadas}`)
    .text(`  Recibidas: ${data.referencias.recibidas}`)
    .text(`  Pendientes: ${data.referencias.pendientes}`)
    .text(`  Completadas: ${data.referencias.completadas}`);
}

function generarTablaPacientesPDF(doc, datos) {
  const headers = ['Nombre', 'CUI', 'Género', 'Edad', 'Municipio', 'Exp.'];
  const colWidths = [150, 80, 50, 40, 90, 50];
  const startX = 50;
  const startY = doc.y;
  
  function dibujarHeaders(yPos) {
    doc.fontSize(8).font('Helvetica-Bold');
    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x, yPos, { width: colWidths[i], continued: false });
      x += colWidths[i];
    });
    doc.moveTo(startX, yPos + 12).lineTo(startX + 460, yPos + 12).stroke();
    return yPos + 18;
  }
  
  let y = dibujarHeaders(startY);

  if (!datos || !datos.data || datos.data.length === 0) {
    doc.font('Helvetica').fontSize(10);
    doc.text('No hay datos para mostrar', startX, y);
    return;
  }

  doc.font('Helvetica').fontSize(7);
  
  datos.data.forEach((item) => {
    if (y > 720) {
      doc.addPage();
      y = 50;
      y = dibujarHeaders(y);
      doc.font('Helvetica').fontSize(7);
    }

    const edad = calcularEdad(item.fechanacimiento);
    const row = [
      truncarTexto(`${item.nombres || ''} ${item.apellidos || ''}`, 30),
      truncarTexto(item.cui || 'N/A', 15),
      item.genero === 'M' ? 'M' : 'F',
      `${edad}`,
      truncarTexto(item.municipio || 'N/A', 18),
      item.tieneExpediente ? 'Sí' : 'No'
    ];

    let x = startX;
    row.forEach((cell, i) => {
      doc.text(cell, x, y, { width: colWidths[i], continued: false });
      x += colWidths[i];
    });

    y += 18;
  });
}

function generarTablaConsultasPDF(doc, datos) {
  const headers = ['Fecha', 'Paciente', 'Médico', 'Motivo Consulta', 'Diagnóstico'];
  const colWidths = [55, 85, 85, 160, 160];
  const startX = 40;
  const startY = doc.y;
  
  function dibujarHeaders(yPos) {
    doc.fontSize(8).font('Helvetica-Bold');
    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x, yPos, { width: colWidths[i], align: 'left', continued: false });
      x += colWidths[i];
    });
    doc.moveTo(startX, yPos + 12).lineTo(startX + 545, yPos + 12).stroke();
    return yPos + 18;
  }
  
  let y = dibujarHeaders(startY);

  if (!datos || !datos.data || datos.data.length === 0) {
    doc.font('Helvetica').fontSize(10);
    doc.text('No hay datos para mostrar', startX, y);
    return;
  }

  doc.font('Helvetica').fontSize(7);
  
  datos.data.forEach((item) => {
    const motivo = item.motivoconsulta || 'N/A';
    const diagnostico = item.diagnosticotratamiento || 'Sin diagnóstico';
    
    // Calcular altura necesaria para el texto más largo
    const alturaMotivo = doc.heightOfString(motivo, { width: colWidths[3] });
    const alturaDiagnostico = doc.heightOfString(diagnostico, { width: colWidths[4] });
    const alturaFila = Math.max(alturaMotivo, alturaDiagnostico, 18) + 8;
    
    // Verificar si necesitamos nueva página
    if (y + alturaFila > 720) {
      doc.addPage();
      y = 50;
      y = dibujarHeaders(y);
      doc.font('Helvetica').fontSize(7);
    }

    const row = [
      new Date(item.fecha).toLocaleDateString('es-GT'),
      `${item.paciente?.nombres || ''} ${item.paciente?.apellidos || ''}`,
      `${item.usuario?.nombres || ''} ${item.usuario?.apellidos || ''}`,
      motivo,
      diagnostico
    ];

    let x = startX;
    row.forEach((cell, i) => {
      doc.text(cell, x, y, { 
        width: colWidths[i], 
        align: 'left',
        lineBreak: true,
        continued: false
      });
      x += colWidths[i];
    });

    y += alturaFila;
  });
}

function generarTablaInventarioPDF(doc, datos) {
  const headers = ['Medicamento', 'Unid.', 'Precio', 'F. Ingreso', 'F. Venc.', 'Estado'];
  const colWidths = [180, 40, 60, 80, 80, 50];
  const startX = 50;
  const startY = doc.y;
  
  function dibujarHeaders(yPos) {
    doc.fontSize(8).font('Helvetica-Bold');
    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x, yPos, { width: colWidths[i], continued: false });
      x += colWidths[i];
    });
    doc.moveTo(startX, yPos + 12).lineTo(startX + 490, yPos + 12).stroke();
    return yPos + 18;
  }
  
  let y = dibujarHeaders(startY);

  if (!datos || !datos.data || datos.data.length === 0) {
    doc.font('Helvetica').fontSize(10);
    doc.text('No hay datos para mostrar', startX, y);
    return;
  }

  doc.font('Helvetica').fontSize(7);
  
  datos.data.forEach((item) => {
    if (y > 720) {
      doc.addPage();
      y = 50;
      y = dibujarHeaders(y);
      doc.font('Helvetica').fontSize(7);
    }

    const row = [
      truncarTexto(item.nombre || '', 35),
      (item.unidades || 0).toString(),
      `Q${(item.precio || 0).toFixed(2)}`,
      item.fechaingreso ? new Date(item.fechaingreso).toLocaleDateString('es-GT') : 'N/A',
      item.fechaegreso ? new Date(item.fechaegreso).toLocaleDateString('es-GT') : 'N/A',
      item.estado === 1 ? 'Activo' : 'Inactivo'
    ];

    let x = startX;
    row.forEach((cell, i) => {
      doc.text(cell, x, y, { width: colWidths[i], continued: false });
      x += colWidths[i];
    });

    y += 18;
  });
}

function generarTablaAgendaPDF(doc, datos) {
  const headers = ['Fecha', 'Hora', 'Paciente', 'Médico', 'Trans.', 'Comentario'];
  const colWidths = [70, 50, 110, 110, 40, 100];
  const startX = 50;
  const startY = doc.y;
  
  function dibujarHeaders(yPos) {
    doc.fontSize(8).font('Helvetica-Bold');
    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x, yPos, { width: colWidths[i], continued: false });
      x += colWidths[i];
    });
    doc.moveTo(startX, yPos + 12).lineTo(startX + 480, yPos + 12).stroke();
    return yPos + 18;
  }
  
  // Función para formatear hora correctamente
  function formatearHora(hora) {
    if (!hora) return '';
    
    // Si es string, retornar directamente
    if (typeof hora === 'string') {
      // Si ya está en formato HH:MM:SS, extraer solo HH:MM
      if (hora.includes(':')) {
        const partes = hora.split(':');
        return `${partes[0]}:${partes[1]}`;
      }
      return hora;
    }
    
    // Si es objeto Date
    if (hora instanceof Date) {
      const horas = hora.getHours().toString().padStart(2, '0');
      const minutos = hora.getMinutes().toString().padStart(2, '0');
      return `${horas}:${minutos}`;
    }
    
    return String(hora);
  }
  
  let y = dibujarHeaders(startY);

  if (!datos || !datos.data || datos.data.length === 0) {
    doc.font('Helvetica').fontSize(10);
    doc.text('No hay datos para mostrar', startX, y);
    return;
  }

  doc.font('Helvetica').fontSize(7);
  
  datos.data.forEach((item) => {
    if (y > 720) {
      doc.addPage();
      y = 50;
      y = dibujarHeaders(y);
      doc.font('Helvetica').fontSize(7);
    }

    const row = [
      new Date(item.fechaatencion).toLocaleDateString('es-GT'),
      formatearHora(item.horaatencion),
      truncarTexto(`${item.paciente?.nombres || ''} ${item.paciente?.apellidos || ''}`, 22),
      truncarTexto(`${item.usuario?.nombres || ''} ${item.usuario?.apellidos || ''}`, 22),
      item.transporte === 1 ? 'Sí' : 'No',
      truncarTexto(item.comentario || 'N/A', 30)
    ];

    let x = startX;
    row.forEach((cell, i) => {
      doc.text(cell, x, y, { width: colWidths[i], continued: false });
      x += colWidths[i];
    });

    y += 18;
  });
}

function generarTablaReferenciasPDF(doc, datos) {
  const headers = ['Fecha', 'Paciente', 'De', 'Para', 'Clínica', 'Estado'];
  const colWidths = [60, 95, 95, 95, 100, 55];
  const startX = 50;
  const startY = doc.y;
  
  function dibujarHeaders(yPos) {
    doc.fontSize(8).font('Helvetica-Bold');
    let x = startX;
    headers.forEach((header, i) => {
      doc.text(header, x, yPos, { width: colWidths[i], continued: false });
      x += colWidths[i];
    });
    doc.moveTo(startX, yPos + 12).lineTo(startX + 500, yPos + 12).stroke();
    return yPos + 18;
  }
  
  let y = dibujarHeaders(startY);

  if (!datos || !datos.data || datos.data.length === 0) {
    doc.font('Helvetica').fontSize(10);
    doc.text('No hay datos para mostrar', startX, y);
    return;
  }

  doc.font('Helvetica').fontSize(7);
  
  datos.data.forEach((item) => {
    if (y > 720) {
      doc.addPage();
      y = 50;
      y = dibujarHeaders(y);
      doc.font('Helvetica').fontSize(7);
    }

    const row = [
      new Date(item.fechacreacion).toLocaleDateString('es-GT'),
      truncarTexto(`${item.paciente?.nombres || ''} ${item.paciente?.apellidos || ''}`, 20),
      truncarTexto(`${item.usuario?.nombres || ''} ${item.usuario?.apellidos || ''}`, 20),
      truncarTexto(`${item.usuarioDestino?.nombres || ''} ${item.usuarioDestino?.apellidos || ''}`, 20),
      truncarTexto(item.clinica?.nombreclinica || 'N/A', 22),
      item.confirmacion4 === 1 ? 'Completado' : 'Pendiente'
    ];

    let x = startX;
    row.forEach((cell, i) => {
      doc.text(cell, x, y, { width: colWidths[i], continued: false });
      x += colWidths[i];
    });

    y += 18;
  });
}

function generarPDFTabla(doc, tipoReporte, datosReporte) {
  switch (tipoReporte) {
    case 'pacientes':
      generarTablaPacientesPDF(doc, datosReporte);
      break;
    case 'consultas':
      generarTablaConsultasPDF(doc, datosReporte);
      break;
    case 'inventario':
      generarTablaInventarioPDF(doc, datosReporte);
      break;
    case 'agenda':
      generarTablaAgendaPDF(doc, datosReporte);
      break;
    case 'referencias':
      generarTablaReferenciasPDF(doc, datosReporte);
      break;
  }
}

// Funciones de Excel (sin cambios)
function generarExcelPacientes(worksheet, datos) {
  worksheet.columns = [
    { header: 'Nombre', key: 'nombre', width: 30 },
    { header: 'CUI', key: 'cui', width: 15 },
    { header: 'Género', key: 'genero', width: 12 },
    { header: 'Edad', key: 'edad', width: 10 },
    { header: 'Municipio', key: 'municipio', width: 25 },
    { header: 'Expediente', key: 'expediente', width: 12 }
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };

  datos.data.forEach(item => {
    const edad = calcularEdad(item.fechanacimiento);
    worksheet.addRow({
      nombre: `${item.nombres} ${item.apellidos}`,
      cui: item.cui || 'N/A',
      genero: item.genero === 'M' ? 'Masculino' : 'Femenino',
      edad: `${edad} años`,
      municipio: item.municipio || 'N/A',
      expediente: item.tieneExpediente ? 'Sí' : 'No'
    });
  });
}

function generarExcelConsultas(worksheet, datos) {
  worksheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 15 },
    { header: 'Paciente', key: 'paciente', width: 30 },
    { header: 'Médico', key: 'medico', width: 30 },
    { header: 'Motivo Consulta', key: 'motivo', width: 50 },
    { header: 'Diagnóstico', key: 'diagnostico', width: 60 }
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };

  datos.data.forEach(item => {
    const row = worksheet.addRow({
      fecha: new Date(item.fecha).toLocaleDateString('es-GT'),
      paciente: `${item.paciente?.nombres} ${item.paciente?.apellidos}`,
      medico: `${item.usuario?.nombres} ${item.usuario?.apellidos}`,
      motivo: item.motivoconsulta || 'N/A',
      diagnostico: item.diagnosticotratamiento || 'Sin diagnóstico'
    });
    
    // Habilitar wrap text para motivo y diagnóstico
    row.getCell('motivo').alignment = { wrapText: true, vertical: 'top' };
    row.getCell('diagnostico').alignment = { wrapText: true, vertical: 'top' };
  });
}

function generarExcelInventario(worksheet, datos) {
  worksheet.columns = [
    { header: 'Medicamento', key: 'medicamento', width: 30 },
    { header: 'Descripción', key: 'descripcion', width: 40 },
    { header: 'Unidades', key: 'unidades', width: 12 },
    { header: 'Precio', key: 'precio', width: 15 },
    { header: 'Fecha Ingreso', key: 'fechaIngreso', width: 18 },
    { header: 'Fecha Vencimiento', key: 'fechaVencimiento', width: 20 },
    { header: 'Estado', key: 'estado', width: 12 }
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };

  datos.data.forEach(item => {
    worksheet.addRow({
      medicamento: item.nombre,
      descripcion: item.descripcion || '',
      unidades: item.unidades,
      precio: `Q${item.precio.toFixed(2)}`,
      fechaIngreso: new Date(item.fechaingreso).toLocaleDateString('es-GT'),
      fechaVencimiento: item.fechaegreso ? new Date(item.fechaegreso).toLocaleDateString('es-GT') : 'N/A',
      estado: item.estado === 1 ? 'Activo' : 'Inactivo'
    });
  });
}

function generarExcelAgenda(worksheet, datos) {
  worksheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 15 },
    { header: 'Hora', key: 'hora', width: 12 },
    { header: 'Paciente', key: 'paciente', width: 30 },
    { header: 'Médico', key: 'medico', width: 30 },
    { header: 'Transporte', key: 'transporte', width: 15 },
    { header: 'Comentario', key: 'comentario', width: 40 }
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };

  // Función para formatear hora en Excel
  function formatearHoraExcel(hora) {
    if (!hora) return '';
    if (typeof hora === 'string') {
      if (hora.includes(':')) {
        const partes = hora.split(':');
        return `${partes[0]}:${partes[1]}`;
      }
      return hora;
    }
    if (hora instanceof Date) {
      const horas = hora.getHours().toString().padStart(2, '0');
      const minutos = hora.getMinutes().toString().padStart(2, '0');
      return `${horas}:${minutos}`;
    }
    return String(hora);
  }

  datos.data.forEach(item => {
    worksheet.addRow({
      fecha: new Date(item.fechaatencion).toLocaleDateString('es-GT'),
      hora: formatearHoraExcel(item.horaatencion),
      paciente: `${item.paciente?.nombres} ${item.paciente?.apellidos}`,
      medico: `${item.usuario?.nombres} ${item.usuario?.apellidos}`,
      transporte: item.transporte === 1 ? 'Sí' : 'No',
      comentario: item.comentario || 'N/A'
    });
  });
}

function generarExcelReferencias(worksheet, datos) {
  worksheet.columns = [
    { header: 'Fecha', key: 'fecha', width: 15 },
    { header: 'Paciente', key: 'paciente', width: 30 },
    { header: 'De', key: 'de', width: 30 },
    { header: 'Para', key: 'para', width: 30 },
    { header: 'Clínica', key: 'clinica', width: 30 },
    { header: 'Estado', key: 'estado', width: 15 }
  ];

  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' }
  };

  datos.data.forEach(item => {
    worksheet.addRow({
      fecha: new Date(item.fechacreacion).toLocaleDateString('es-GT'),
      paciente: `${item.paciente?.nombres} ${item.paciente?.apellidos}`,
      de: `${item.usuario?.nombres} ${item.usuario?.apellidos}`,
      para: `${item.usuarioDestino?.nombres} ${item.usuarioDestino?.apellidos}`,
      clinica: item.clinica?.nombreclinica || 'N/A',
      estado: item.confirmacion4 === 1 ? 'Completado' : 'Pendiente'
    });
  });
}

// ==========================================
// SERVICIO PRINCIPAL
// ==========================================

const reporteriaService = {

  async obtenerDashboard(usuario) {
    try {
      const hoy = new Date();
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol.rol.nombre.toLowerCase().includes('admin');

      const [totalPacientes, pacientesActivos, pacientesNuevosMes] = await Promise.all([
        prisma.paciente.count(),
        prisma.paciente.count({ where: { estado: 1 } }),
        prisma.paciente.count({ 
          where: { 
            fechacreacion: { gte: primerDiaMes },
            estado: 1 
          } 
        })
      ]);

      const consultasMes = await prisma.detallehistorialclinico.count({
        where: {
          fecha: { gte: primerDiaMes },
          estado: 1,
          ...(esAdmin ? {} : { fkusuario: usuario.idusuario })
        }
      });

      const [totalMedicamentos, medicamentosActivos, stockBajo, proximosVencer] = await Promise.all([
        prisma.inventariomedico.count({ where: { estado: 1 } }),  
        prisma.inventariomedico.count({
          where: {
            estado: 1,
            unidades: { lte: 10 }
          }
        }),
        prisma.inventariomedico.count({
          where: {
            estado: 1,
            fechaegreso: {
              lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      const inventarioTotal = await prisma.inventariomedico.aggregate({
        where: { estado: 1 },
        _sum: {
          precio: true
        }
      });

      const citasMes = await prisma.agenda.count({
        where: {
          fechaatencion: { gte: primerDiaMes },
          estado: 1,
          ...(esAdmin ? {} : { fkusuario: usuario.idusuario })
        }
      });

      const whereReferencias = {
        estado: 1,
        ...(esAdmin ? {} : {
          OR: [
            { fkusuario: usuario.idusuario },
            { fkusuariodestino: usuario.idusuario }
          ]
        })
      };

      const [totalReferencias, enviadas, recibidas, pendientes, completadas] = await Promise.all([
        prisma.detallereferirpaciente.count({ where: whereReferencias }),
        prisma.detallereferirpaciente.count({
          where: {
            ...whereReferencias,
            fkusuario: usuario.idusuario
          }
        }),
        prisma.detallereferirpaciente.count({
          where: {
            ...whereReferencias,
            fkusuariodestino: usuario.idusuario
          }
        }),
        prisma.detallereferirpaciente.count({
          where: {
            ...whereReferencias,
            confirmacion4: 0
          }
        }),
        prisma.detallereferirpaciente.count({
          where: {
            ...whereReferencias,
            confirmacion4: 1
          }
        })
      ]);

      return {
        pacientes: {
          total: totalPacientes,
          activos: pacientesActivos,
          inactivos: totalPacientes - pacientesActivos,
          nuevosMes: pacientesNuevosMes
        },
        consultas: {
          totalMes: consultasMes
        },
        inventario: {
          total: totalMedicamentos,
          activos: medicamentosActivos,
          alertasStockBajo: stockBajo,
          proximosVencer: proximosVencer,
          valorTotal: inventarioTotal._sum.precio || 0
        },
        agenda: {
          citasMes: citasMes
        },
        referencias: {
          total: totalReferencias,
          enviadas,
          recibidas,
          pendientes,
          completadas
        }
      };

    } catch (error) {
      console.error('Error en obtenerDashboard service:', error);
      throw error;
    }
  },

  async obtenerReportePacientes(filtros) {
    try {
      const { desde, hasta, genero, municipio, edadMin, edadMax, tipodiscapacidad, page, limit } = filtros;
      const skip = (page - 1) * limit;

      const whereClause = { estado: 1 };

      // VALIDACIÓN DE FECHAS
      if (esFechaValida(desde) || esFechaValida(hasta)) {
        whereClause.fechacreacion = {};
        if (esFechaValida(desde)) whereClause.fechacreacion.gte = new Date(desde);
        if (esFechaValida(hasta)) whereClause.fechacreacion.lte = new Date(hasta);
      }

      if (genero && genero !== '') whereClause.genero = genero.toUpperCase();
      if (municipio && municipio !== '') whereClause.municipio = { contains: municipio, mode: 'insensitive' };
      if (tipodiscapacidad && tipodiscapacidad !== '') whereClause.tipodiscapacidad = { contains: tipodiscapacidad, mode: 'insensitive' };

      // VALIDACIÓN DE EDADES
      const edadMinNum = parseInt(edadMin);
      const edadMaxNum = parseInt(edadMax);
      
      if (!isNaN(edadMinNum) || !isNaN(edadMaxNum)) {
        const hoy = new Date();
        whereClause.fechanacimiento = {};
        
        if (!isNaN(edadMaxNum)) {
          const fechaMinNacimiento = new Date(hoy.getFullYear() - edadMaxNum - 1, hoy.getMonth(), hoy.getDate());
          whereClause.fechanacimiento.gte = fechaMinNacimiento;
        }
        
        if (!isNaN(edadMinNum)) {
          const fechaMaxNacimiento = new Date(hoy.getFullYear() - edadMinNum, hoy.getMonth(), hoy.getDate());
          whereClause.fechanacimiento.lte = fechaMaxNacimiento;
        }
      }

      const [pacientes, total] = await Promise.all([
        prisma.paciente.findMany({
          where: whereClause,
          include: {
            expedientes: { where: { estado: 1 }, select: { numeroexpediente: true, fechacreacion: true } }
          },
          orderBy: { fechacreacion: 'desc' },
          skip,
          take: limit
        }),
        prisma.paciente.count({ where: whereClause })
      ]);

      const pacientesConEdad = pacientes.map(p => ({
        ...p,
        edad: calcularEdad(p.fechanacimiento),
        tieneExpediente: p.expedientes.length > 0
      }));

      const resumen = {
        totalPacientes: total,
        porGenero: {
          masculino: pacientes.filter(p => p.genero === 'M').length,
          femenino: pacientes.filter(p => p.genero === 'F').length
        },
        conExpediente: pacientes.filter(p => p.expedientes.length > 0).length,
        sinExpediente: pacientes.filter(p => p.expedientes.length === 0).length
      };

      return {
        data: pacientesConEdad,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        resumen
      };
    } catch (error) {
      console.error('Error en obtenerReportePacientes service:', error);
      throw error;
    }
  },

  async obtenerReporteConsultas(filtros, usuario) {
    try {
      const { desde, hasta, medico, paciente, diagnostico, page, limit } = filtros;
      const skip = (page - 1) * limit;

      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol.rol.nombre.toLowerCase().includes('admin');
      const whereClause = { estado: 1 };

      if (!esAdmin) whereClause.fkusuario = usuario.idusuario;
      
      // VALIDACIÓN DE FECHAS
      if (esFechaValida(desde) || esFechaValida(hasta)) {
        whereClause.fecha = {};
        if (esFechaValida(desde)) whereClause.fecha.gte = new Date(desde);
        if (esFechaValida(hasta)) whereClause.fecha.lte = new Date(hasta);
      }
      
      const medicoNum = parseInt(medico);
      const pacienteNum = parseInt(paciente);
      
      if (!isNaN(medicoNum) && esAdmin) whereClause.fkusuario = medicoNum;
      if (!isNaN(pacienteNum)) whereClause.fkpaciente = pacienteNum;
      if (diagnostico && diagnostico !== '') whereClause.diagnosticotratamiento = { contains: diagnostico, mode: 'insensitive' };

      const [consultas, total] = await Promise.all([
        prisma.detallehistorialclinico.findMany({
          where: whereClause,
          include: {
            paciente: { select: { idpaciente: true, nombres: true, apellidos: true, cui: true, fechanacimiento: true } },
            usuario: { select: { idusuario: true, nombres: true, apellidos: true, profesion: true } }
          },
          orderBy: { fecha: 'desc' },
          skip,
          take: limit
        }),
        prisma.detallehistorialclinico.count({ where: whereClause })
      ]);

      const consultasPorMedico = await prisma.detallehistorialclinico.groupBy({
        by: ['fkusuario'],
        where: whereClause,
        _count: true
      });

      const resumen = {
        totalConsultas: total,
        conDiagnostico: consultas.filter(c => c.diagnosticotratamiento).length,
        conArchivos: consultas.filter(c => c.rutahistorialclinico).length,
        porMedico: consultasPorMedico.length
      };

      return {
        data: consultas,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        resumen
      };
    } catch (error) {
      console.error('Error en obtenerReporteConsultas service:', error);
      throw error;
    }
  },

  async obtenerReporteInventario(filtros) {
    try {
      const { estado, stockMinimo, proximosVencer, usuario, page, limit } = filtros;
      const skip = (page - 1) * limit;
      const whereClause = {};

      if (estado === 'activo') whereClause.estado = 1;
      else if (estado === 'inactivo') whereClause.estado = 0;
      
      const stockMin = parseInt(stockMinimo);
      const diasVencer = parseInt(proximosVencer);
      const usuarioNum = parseInt(usuario);
      
      if (!isNaN(stockMin)) whereClause.unidades = { lte: stockMin };
      
      if (!isNaN(diasVencer)) {
        const fechaLimite = new Date(Date.now() + diasVencer * 24 * 60 * 60 * 1000);
        whereClause.fechaegreso = { lte: fechaLimite };
      }
      
      if (!isNaN(usuarioNum)) whereClause.fkusuario = usuarioNum;

      const [medicamentos, total] = await Promise.all([
        prisma.inventariomedico.findMany({
          where: whereClause,
          include: { usuario: { select: { nombres: true, apellidos: true } } },
          orderBy: { fechacreacion: 'desc' },
          skip,
          take: limit
        }),
        prisma.inventariomedico.count({ where: whereClause })
      ]);

      const alertas = {
        stockBajo: medicamentos.filter(m => m.unidades <= 10 && m.estado === 1),
        proximosVencer: medicamentos.filter(m => {
          if (!m.fechaegreso || m.estado === 0) return false;
          const diasRestantes = Math.ceil((new Date(m.fechaegreso) - new Date()) / (1000 * 60 * 60 * 24));
          return diasRestantes <= 30 && diasRestantes >= 0;
        }),
        vencidos: medicamentos.filter(m => {
          if (!m.fechaegreso) return false;
          return new Date(m.fechaegreso) < new Date();
        })
      };

      const valorTotal = medicamentos.reduce((sum, m) => {
        const precio = parseFloat(m.precio) || 0;
        const unidades = m.unidades || 0;
        return sum + (precio * unidades);
      }, 0);

      const resumen = {
        totalMedicamentos: total,
        activos: medicamentos.filter(m => m.estado === 1).length,
        inactivos: medicamentos.filter(m => m.estado === 0).length,
        valorTotalInventario: valorTotal,
        unidadesTotales: medicamentos.reduce((sum, m) => sum + (m.unidades || 0), 0)
      };

      return {
        data: medicamentos,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        resumen,
        alertas: {
          stockBajo: alertas.stockBajo.length,
          proximosVencer: alertas.proximosVencer.length,
          vencidos: alertas.vencidos.length
        }
      };
    } catch (error) {
      console.error('Error en obtenerReporteInventario service:', error);
      throw error;
    }
  },

  async obtenerReporteAgenda(filtros, usuario) {
    try {
      const { desde, hasta, medico, mes, anio, transporte, page, limit } = filtros;
      const skip = (page - 1) * limit;

      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol.rol.nombre.toLowerCase().includes('admin');
      const whereClause = { estado: 1 };

      if (!esAdmin) whereClause.fkusuario = usuario.idusuario;
      
      // VALIDACIÓN DE FECHAS
      if (esFechaValida(desde) || esFechaValida(hasta)) {
        whereClause.fechaatencion = {};
        if (esFechaValida(desde)) whereClause.fechaatencion.gte = new Date(desde);
        if (esFechaValida(hasta)) whereClause.fechaatencion.lte = new Date(hasta);
      }
      
      const mesNum = parseInt(mes);
      const anioNum = parseInt(anio);
      const medicoNum = parseInt(medico);
      const transporteNum = parseInt(transporte);
      
      if (!isNaN(mesNum) && !isNaN(anioNum)) {
        const primerDia = new Date(anioNum, mesNum - 1, 1);
        const ultimoDia = new Date(anioNum, mesNum, 0);
        whereClause.fechaatencion = { gte: primerDia, lte: ultimoDia };
      }
      
      if (!isNaN(medicoNum) && esAdmin) whereClause.fkusuario = medicoNum;
      if (!isNaN(transporteNum)) whereClause.transporte = transporteNum;

      const [citas, total] = await Promise.all([
        prisma.agenda.findMany({
          where: whereClause,
          include: {
            paciente: { select: { idpaciente: true, nombres: true, apellidos: true, cui: true, telefonopersonal: true } },
            usuario: { select: { idusuario: true, nombres: true, apellidos: true, profesion: true } }
          },
          orderBy: [{ fechaatencion: 'desc' }, { horaatencion: 'desc' }],
          skip,
          take: limit
        }),
        prisma.agenda.count({ where: whereClause })
      ]);

      // FORMATEAR HORA ANTES DE ENVIAR AL FRONTEND (SIN CONVERSIÓN DE ZONA HORARIA)
      const citasFormateadas = citas.map(cita => {
        let horaFormateada = '';
        
        if (cita.horaatencion) {
          if (typeof cita.horaatencion === 'string') {
            // Si ya es string, extraer solo HH:MM
            if (cita.horaatencion.includes(':')) {
              const partes = cita.horaatencion.split(':');
              horaFormateada = `${partes[0]}:${partes[1]}`;
            } else {
              horaFormateada = cita.horaatencion;
            }
          } else if (cita.horaatencion instanceof Date) {
            // CRÍTICO: Usar UTC para evitar conversión de zona horaria
            const horas = cita.horaatencion.getUTCHours().toString().padStart(2, '0');
            const minutos = cita.horaatencion.getUTCMinutes().toString().padStart(2, '0');
            horaFormateada = `${horas}:${minutos}`;
          } else {
            horaFormateada = String(cita.horaatencion);
          }
        }
        
        return {
          ...cita,
          horaatencion: horaFormateada
        };
      });

      const resumen = {
        totalCitas: total,
        conTransporte: citas.filter(c => c.transporte === 1).length,
        sinTransporte: citas.filter(c => c.transporte === 0).length
      };

      return {
        data: citasFormateadas,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        resumen
      };
    } catch (error) {
      console.error('Error en obtenerReporteAgenda service:', error);
      throw error;
    }
  },

  async obtenerReporteReferencias(filtros, usuario) {
    try {
      const { tipo, estado, clinica, medico, desde, hasta, page, limit } = filtros;
      const skip = (page - 1) * limit;

      const usuarioConRol = await prisma.usuario.findUnique({
        where: { idusuario: usuario.idusuario },
        include: { rol: true }
      });

      const esAdmin = usuarioConRol.rol.nombre.toLowerCase().includes('admin');
      const whereClause = { estado: 1 };

      if (tipo === 'enviadas') whereClause.fkusuario = usuario.idusuario;
      else if (tipo === 'recibidas') whereClause.fkusuariodestino = usuario.idusuario;
      else if (!esAdmin) {
        whereClause.OR = [
          { fkusuario: usuario.idusuario },
          { fkusuariodestino: usuario.idusuario }
        ];
      }

      if (estado === 'pendiente') whereClause.confirmacion4 = 0;
      else if (estado === 'proceso') {
        whereClause.confirmacion1 = 1;
        whereClause.confirmacion4 = 0;
      } else if (estado === 'completado') whereClause.confirmacion4 = 1;

      const clinicaNum = parseInt(clinica);
      const medicoNum = parseInt(medico);
      
      if (!isNaN(clinicaNum)) whereClause.fkclinica = clinicaNum;
      if (!isNaN(medicoNum)) {
        whereClause.OR = [
          { fkusuario: medicoNum },
          { fkusuariodestino: medicoNum }
        ];
      }
      
      // VALIDACIÓN DE FECHAS
      if (esFechaValida(desde) || esFechaValida(hasta)) {
        whereClause.fechacreacion = {};
        if (esFechaValida(desde)) whereClause.fechacreacion.gte = new Date(desde);
        if (esFechaValida(hasta)) whereClause.fechacreacion.lte = new Date(hasta);
      }

      const [referencias, total] = await Promise.all([
        prisma.detallereferirpaciente.findMany({
          where: whereClause,
          include: {
            paciente: { select: { idpaciente: true, nombres: true, apellidos: true, cui: true } },
            clinica: { select: { idclinica: true, nombreclinica: true } },
            usuario: { select: { idusuario: true, nombres: true, apellidos: true, profesion: true } },
            usuarioDestino: { select: { idusuario: true, nombres: true, apellidos: true, profesion: true } }
          },
          orderBy: { fechacreacion: 'desc' },
          skip,
          take: limit
        }),
        prisma.detallereferirpaciente.count({ where: whereClause })
      ]);

      const resumen = {
        total,
        pendientes: referencias.filter(r => r.confirmacion4 === 0).length,
        completadas: referencias.filter(r => r.confirmacion4 === 1).length,
        enviadas: referencias.filter(r => r.fkusuario === usuario.idusuario).length,
        recibidas: referencias.filter(r => r.fkusuariodestino === usuario.idusuario).length
      };

      return {
        data: referencias,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        resumen
      };
    } catch (error) {
      console.error('Error en obtenerReporteReferencias service:', error);
      throw error;
    }
  },

  async generarPDF(params) {
    try {
      const { tipoReporte, filtros, titulo, usuario } = params;

      let datosReporte;

      switch (tipoReporte.toLowerCase()) {
        case 'pacientes':
          datosReporte = await this.obtenerReportePacientes({ ...filtros, page: 1, limit: 10000 });
          break;
        case 'consultas':
          datosReporte = await this.obtenerReporteConsultas({ ...filtros, page: 1, limit: 10000 }, usuario);
          break;
        case 'inventario':
          datosReporte = await this.obtenerReporteInventario({ ...filtros, page: 1, limit: 10000 });
          break;
        case 'agenda':
          datosReporte = await this.obtenerReporteAgenda({ ...filtros, page: 1, limit: 10000 }, usuario);
          break;
        case 'referencias':
          datosReporte = await this.obtenerReporteReferencias({ ...filtros, page: 1, limit: 10000 }, usuario);
          break;
        case 'dashboard':
          datosReporte = await this.obtenerDashboard(usuario);
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      const doc = new PDFDocument({ 
        margin: 50,
        size: 'LETTER'
      });
      
      const chunks = [];
      doc.on('data', chunk => chunks.push(chunk));
      
      return new Promise((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Header
        doc.fontSize(18).font('Helvetica-Bold').text(titulo, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(`Fecha: ${new Date().toLocaleDateString('es-GT')}`, { align: 'center' });
        doc.moveDown(1);

        // Contenido
        if (tipoReporte === 'dashboard') {
          generarPDFDashboard(doc, datosReporte);
        } else {
          generarPDFTabla(doc, tipoReporte, datosReporte);
        }

        doc.end();
      });

    } catch (error) {
      console.error('Error en generarPDF service:', error);
      throw error;
    }
  },

  async exportarExcel(params) {
    try {
      const { tipoReporte, filtros, nombreArchivo, usuario } = params;

      let datosReporte;

      switch (tipoReporte.toLowerCase()) {
        case 'pacientes':
          datosReporte = await this.obtenerReportePacientes({ ...filtros, page: 1, limit: 10000 });
          break;
        case 'consultas':
          datosReporte = await this.obtenerReporteConsultas({ ...filtros, page: 1, limit: 10000 }, usuario);
          break;
        case 'inventario':
          datosReporte = await this.obtenerReporteInventario({ ...filtros, page: 1, limit: 10000 });
          break;
        case 'agenda':
          datosReporte = await this.obtenerReporteAgenda({ ...filtros, page: 1, limit: 10000 }, usuario);
          break;
        case 'referencias':
          datosReporte = await this.obtenerReporteReferencias({ ...filtros, page: 1, limit: 10000 }, usuario);
          break;
        default:
          throw new Error('Tipo de reporte no válido');
      }

      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Reporte');

      switch (tipoReporte.toLowerCase()) {
        case 'pacientes':
          generarExcelPacientes(worksheet, datosReporte);
          break;
        case 'consultas':
          generarExcelConsultas(worksheet, datosReporte);
          break;
        case 'inventario':
          generarExcelInventario(worksheet, datosReporte);
          break;
        case 'agenda':
          generarExcelAgenda(worksheet, datosReporte);
          break;
        case 'referencias':
          generarExcelReferencias(worksheet, datosReporte);
          break;
      }

      return await workbook.xlsx.writeBuffer();

    } catch (error) {
      console.error('Error en exportarExcel service:', error);
      throw error;
    }
  }
};

module.exports = reporteriaService;