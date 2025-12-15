const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

class AgendaService{
    convertirFecha(fechaString) {
        if (!fechaString) return null;
        
        // Si ya es un objeto Date, devolverlo tal como está
        if (fechaString instanceof Date) return fechaString;
        
        // Convertir string a Date
        const fecha = new Date(fechaString);
        
        // Verificar que la fecha sea válida
        if (isNaN(fecha.getTime())) {
            throw new Error(`Fecha inválida: ${fechaString}`);
        }
        
        return fecha;
    }

    async crearCita(agendaData){
        try{
            const { fkusuario, fkpaciente, fechaatencion, horaatencion, comentario, transporte, fechatransporte, horariotransporte, direccion,
                    usuariocreacion, estado } = agendaData;

            if(!fkusuario || !fkpaciente || !fechaatencion || !horaatencion || !usuariocreacion){
                return{
                    success: false,
                    message: 'Complete los campos requeridos'
                };
            }

            let horaFormateada = horaatencion;

            // Si viene en formato HH:mm:ss, usarla directamente
            // Si viene en formato HH:mm, agregar :00
            if (horaatencion.split(':').length === 2) {
                horaFormateada = `${horaatencion}:00`;
            }

            const fechaConvertida = this.convertirFecha(fechaatencion);
            const horaConvertida = new Date(`1970-01-01T${horaFormateada}Z`);

            // Verificar si ya existe una cita para el paciente en esa fecha y hora
            const citaExistente = await prisma.agenda.findFirst({
                where: {
                    fkpaciente:    parseInt(fkpaciente),
                    fechaatencion: fechaConvertida,
                    horaatencion:  horaConvertida,
                    estado: {
                        not: 0
                    }
                }
            });

            if(citaExistente){
                return{
                    success: false,
                    message: 'El paciente ya tiene cita programada en la fecha y hora seleccionada'
                };
            }

            const citaExistenteUsuario = await prisma.agenda.findFirst({
                where:{
                    fkusuario:     parseInt(fkusuario),
                    fechaatencion: fechaConvertida,
                    horaatencion:  horaConvertida,
                    estado:{
                        not: 0
                    }
                }
            });

            if(citaExistenteUsuario){
                return{
                    success: false,
                    message: 'El profesional ya tiene cita programada en la fecha y hora seleccionada'
                };
            }

            const citaNueva = await prisma.agenda.create({
                data:{
                    fkusuario:          parseInt(fkusuario),
                    fkpaciente:         parseInt(fkpaciente),
                    fechaatencion:      fechaConvertida,
                    horaatencion:       horaConvertida,
                    comentario:         comentario,
                    transporte:         parseInt(transporte),
                    fechatransporte:    this.convertirFecha(fechatransporte),
                    horariotransporte:  horariotransporte
                                        ? new Date(`1970-01-01T${horariotransporte}:00Z`)
                                        : null,
                    direccion:          direccion,
                    usuariocreacion:    usuariocreacion,
                    estado:             parseInt(estado)
                },
                select:{
                    fkusuario:          true,
                    fkpaciente:         true,
                    fechaatencion:      true,
                    horaatencion:       true,
                    comentario:         true,
                    transporte:         true,
                    fechatransporte:    true,
                    horariotransporte:  true,
                    direccion:          true,
                    estado:             true
                }
            });

            return{
                success: true,
                message: 'Cita creada exitosamente',
                data: citaNueva // Cambiado para devolver la cita creada
            };
        }catch(error){
            return{
                success: false,
                message: 'Error al crear la cita: ' + error.message
            };
        }
    }

    async obtenerCitas(){
        try{
            const agenda = await prisma.agenda.findMany({
                where:{
                    estado: 1
                },
                select:{
                    idagenda:            true,
                    fkusuario:           true,
                    fkpaciente:          true,
                    fechaatencion:       true,
                    horaatencion:        true,
                    comentario:          true,
                    transporte:          true,
                    fechatransporte:     true,
                    horariotransporte:   true,
                    direccion:           true,
                    estado:              true,
                    fkagenda_recurrente: true,
                    es_recurrente:       true,
                    usuario: {
                        select: {
                            idusuario:   true,
                            nombres:     true,
                            apellidos:   true
                        }
                    },
                    paciente: {
                        select: {
                            idpaciente:        true,
                            nombres:           true,
                            apellidos:         true,
                            nombreencargado:   true,
                            telefonoencargado: true
                        }
                    }
                },
                orderBy:{
                    fkpaciente: 'asc'
                }
            });

            // Formatear las fechas y horas para el frontend
            const agendaFormateada = agenda.map(cita => {
                // Formatear fecha de atención
                const fechaAtencion = new Date(cita.fechaatencion);
                const fechaStr = fechaAtencion.toISOString().split('T')[0];
                
                // Formatear hora de atención
                const horaAtencion = new Date(cita.horaatencion);
                const horaStr = horaAtencion.toISOString().split('T')[1].substring(0, 8);
                
                // Formatear fecha de transporte si existe
                let fechaTransporteStr = null;
                if (cita.fechatransporte) {
                    const fechaTransporte = new Date(cita.fechatransporte);
                    fechaTransporteStr = fechaTransporte.toISOString().split('T')[0];
                }
                
                // Formatear hora de transporte si existe
                let horaTransporteStr = null;
                if (cita.horariotransporte) {
                    const horaTransporte = new Date(cita.horariotransporte);
                    horaTransporteStr = horaTransporte.toISOString().split('T')[1].substring(0, 8);
                }
                
                return {
                    ...cita,
                    fechaatencion: fechaStr,
                    horaatencion: horaStr,
                    fechatransporte: fechaTransporteStr,
                    horariotransporte: horaTransporteStr,
                    es_recurrente: cita.es_recurrente || false,
                    fkagenda_recurrente: cita.fkagenda_recurrente || null
                };
            });

            return{
                success: true,
                data: agendaFormateada
            };
        }catch(error){
            return{
                success: false,
                message: 'Error al obtener la cita: ' + error.message
            };
        }
    }

    async obtenerCitasConTransporte(fecha) {
        try {
            // Si no se proporciona fecha, usar la fecha actual en formato YYYY-MM-DD
            let fechaBusqueda = fecha;
            
            if (!fechaBusqueda) {
                const hoy = new Date();
                // Ajustar a la zona horaria local antes de formatear
                const offset = hoy.getTimezoneOffset();
                const fechaLocal = new Date(hoy.getTime() - (offset * 60 * 1000));
                fechaBusqueda = fechaLocal.toISOString().split('T')[0];
            }

            // SOLUCIÓN: Usar Prisma.sql para comparación exacta de fechas sin conversión
            const citasConTransporte = await prisma.agenda.findMany({
                where: {
                    estado: 1,
                    transporte: 1,
                    // Comparación directa sin conversión de zona horaria
                    fechatransporte: {
                        equals: new Date(fechaBusqueda + 'T00:00:00.000Z')
                    }
                },
                select: {
                    idagenda:          true,
                    fkusuario:         true,
                    fkpaciente:        true,
                    fechaatencion:     true,
                    horaatencion:      true,
                    comentario:        true,
                    transporte:        true,
                    fechatransporte:   true,
                    horariotransporte: true,
                    direccion:         true,
                    estado:            true,

                    usuario: {
                        select: {
                            idusuario: true,
                            nombres:   true,
                            apellidos: true,
                            profesion: true
                        }
                    },
                    paciente: {
                        select: {
                            idpaciente:        true,
                            nombres:           true,
                            apellidos:         true,
                            cui:               true,
                            nombreencargado:   true,
                            telefonoencargado: true,
                            municipio:         true,
                            aldea:             true,
                            direccion:         true
                        }
                    }
                },
                orderBy: [
                    {
                        horariotransporte: 'asc'
                    }
                ]
            });

            // Formatear las fechas y horas para el frontend
            const citasFormateadas = citasConTransporte.map(cita => {
                // Formatear fecha de atención
                let fechaAtencionStr = cita.fechaatencion;
                if (cita.fechaatencion instanceof Date) {
                    fechaAtencionStr = cita.fechaatencion.toISOString().split('T')[0];
                }
                
                // Formatear hora de atención
                let horaAtencionStr = cita.horaatencion;
                if (cita.horaatencion instanceof Date) {
                    horaAtencionStr = cita.horaatencion.toISOString().split('T')[1].substring(0, 8);
                }
                
                // Formatear fecha de transporte
                let fechaTransporteStr = cita.fechatransporte;
                if (cita.fechatransporte instanceof Date) {
                    fechaTransporteStr = cita.fechatransporte.toISOString().split('T')[0];
                }
                
                // La hora de transporte ya viene en formato correcto
                let horaTransporteStr = cita.horariotransporte;
                
                // Construir dirección completa del paciente
                const direccionCompleta = cita.direccion || 
                    [
                        cita.paciente?.municipio,
                        cita.paciente?.aldea,
                        cita.paciente?.direccion
                    ].filter(Boolean).join(', ');
                
                return {
                    idagenda: cita.idagenda,
                    fkusuario: cita.fkusuario,
                    fkpaciente: cita.fkpaciente,
                    fechaatencion: fechaAtencionStr,
                    horaatencion: horaAtencionStr,
                    comentario: cita.comentario,
                    transporte: cita.transporte,
                    fechatransporte: fechaTransporteStr,
                    horariotransporte: horaTransporteStr,
                    direccion: direccionCompleta,
                    estado: cita.estado,
                    usuario: {
                        idusuario: cita.usuario.idusuario,
                        nombres: cita.usuario.nombres,
                        apellidos: cita.usuario.apellidos,
                        profesion: cita.usuario.profesion || ''
                    },
                    paciente: {
                        idpaciente: cita.paciente.idpaciente,
                        nombres: cita.paciente.nombres,
                        apellidos: cita.paciente.apellidos,
                        cui: cita.paciente.cui || '',
                        nombreencargado: cita.paciente.nombreencargado || '',
                        telefonoencargado: cita.paciente.telefonoencargado || '',
                        municipio: cita.paciente.municipio || '',
                        aldea: cita.paciente.aldea || '',
                        direccion: cita.paciente.direccion || ''
                    }
                };
            });

            return {
                success: true,
                data: citasFormateadas,
                total: citasFormateadas.length,
                fecha: fechaBusqueda
            };
        } catch (error) {
            return{
                success: false,
                message: 'Error al obtener citas con transporte la cita: ' + error.message
            };
        }
    }

    async actualizarCita(idagenda, agendaData){
        try{
            const { fkusuario, fkpaciente, fechaatencion, horaatencion, comentario, transporte, fechatransporte, horariotransporte, direccion,
                    usuariomodificacion, estado } = agendaData;

            // Validar que la cita existe
            const citaExistente = await prisma.agenda.findUnique({
                where: { idagenda: parseInt(idagenda) }
            });

            if(!citaExistente){
                return{
                    success: false,
                    message: 'La cita no existe'
                };
            }

            // Validar campos requeridos
            if(!fkusuario || !fkpaciente || !fechaatencion || !horaatencion){
                return{
                    success: false,
                    message: 'Complete los campos requeridos'
                };
            }

            let horaFormateada = horaatencion;

            // Si viene en formato HH:mm:ss, usarla directamente
            // Si viene en formato HH:mm, agregar :00
            if (horaatencion.split(':').length === 2) {
                horaFormateada = `${horaatencion}:00`;
            }

            const fechaConvertida = this.convertirFecha(fechaatencion);
            const horaConvertida = new Date(`1970-01-01T${horaFormateada}Z`);

            // IMPORTANTE: Excluir la cita actual de la búsqueda
            const citaExistentePaciente = await prisma.agenda.findFirst({
                where: {
                    fkpaciente:    parseInt(fkpaciente),
                    fechaatencion: fechaConvertida,
                    horaatencion:  horaConvertida,
                    estado: {
                        not: 0
                    },
                    idagenda: {
                        not: parseInt(idagenda) // EXCLUIR LA CITA ACTUAL
                    }
                }
            });

            if(citaExistentePaciente){
                return{
                    success: false,
                    message: 'El paciente ya tiene cita programada en la fecha y hora seleccionada'
                };
            }

            const citaExistenteUsuario = await prisma.agenda.findFirst({
                where:{
                    fkusuario:     parseInt(fkusuario),
                    fechaatencion: fechaConvertida,
                    horaatencion:  horaConvertida,
                    estado:{
                        not: 0
                    },
                    idagenda: {
                        not: parseInt(idagenda) // EXCLUIR LA CITA ACTUAL
                    }
                }
            });

            if(citaExistenteUsuario){
                return{
                    success: false,
                    message: 'El profesional ya tiene cita programada en la fecha y hora seleccionada'
                };
            }

            // Formatear hora de transporte si existe
            let horaTransporteFormateada = null;
            if (horariotransporte) {
                if (horariotransporte.split(':').length === 2) {
                    horaTransporteFormateada = `${horariotransporte}:00`;
                } else {
                    horaTransporteFormateada = horariotransporte;
                }
            }

            const citaActualizada = await prisma.agenda.update({
                where: {
                    idagenda:           parseInt(idagenda)
                },
                data:{
                    fkusuario:          parseInt(fkusuario),
                    fkpaciente:         parseInt(fkpaciente),
                    fechaatencion:      fechaConvertida,
                    horaatencion:       horaConvertida,
                    comentario:         comentario || null,
                    transporte:         parseInt(transporte),
                    fechatransporte:    fechatransporte ? this.convertirFecha(fechatransporte) : null,
                    horariotransporte:  horaTransporteFormateada
                                        ? new Date(`1970-01-01T${horaTransporteFormateada}Z`)
                                        : null,
                    direccion:          direccion || null,
                    usuariomodificacion: usuariomodificacion || null,
                    fechamodificacion:  new Date(),
                    estado:             estado !== undefined ? parseInt(estado) : citaExistente.estado
                },
                select:{
                    idagenda:          true,
                    fkusuario:         true,
                    fkpaciente:        true,
                    fechaatencion:     true,
                    horaatencion:      true,
                    comentario:        true,
                    transporte:        true,
                    fechatransporte:   true,
                    horariotransporte: true,
                    direccion:         true,
                    estado:            true,
                    fkagenda_recurrente: true,
                    es_recurrente:       true,
                    usuario: {
                        select: {
                            idusuario: true,
                            nombres:   true,
                            apellidos: true
                        }
                    },
                    paciente: {
                        select: {
                            idpaciente:        true,
                            nombres:           true,
                            apellidos:         true,
                            nombreencargado:   true,
                            telefonoencargado: true
                        }
                    }
                }
            });

            // Formatear las fechas para el frontend
            const fechaStr = citaActualizada.fechaatencion.toISOString().split('T')[0];
            const horaStr = citaActualizada.horaatencion.toISOString().split('T')[1].substring(0, 8);
            
            let fechaTransporteStr = null;
            if (citaActualizada.fechatransporte) {
                fechaTransporteStr = citaActualizada.fechatransporte.toISOString().split('T')[0];
            }
            
            let horaTransporteStr = null;
            if (citaActualizada.horariotransporte) {
                horaTransporteStr = citaActualizada.horariotransporte.toISOString().split('T')[1].substring(0, 8);
            }

            return{
                success: true,
                message: 'Cita actualizada exitosamente',
                data: {
                    ...citaActualizada,
                    fechaatencion: fechaStr,
                    horaatencion: horaStr,
                    fechatransporte: fechaTransporteStr,
                    horariotransporte: horaTransporteStr
                }
            };
        }catch(error){
            return{
                success: false,
                message: 'Error al actualizar la cita: ' + error.message
            };
        }
    }

    async eliminarCita(idagenda, usuarioModificacion){
        try{
            // Validar que la cita existe
            const citaExistente = await prisma.agenda.findUnique({
                where: { idagenda: parseInt(idagenda) }
            });

            if(!citaExistente){
                return{
                    success: false,
                    message: 'La cita no existe'
                };
            }

            // Verificar que no esté ya eliminada
            if(citaExistente.estado === 0){
                return{
                    success: false,
                    message: 'La cita ya está eliminada'
                };
            }

            // Cambiar estado a ELIMINADA (soft delete)
            const citaEliminada = await prisma.agenda.update({
                where: {
                    idagenda: parseInt(idagenda)
                },
                data: {
                    estado: 0,
                    usuariomodificacion: usuarioModificacion
                }
            });

            return{
                success: true,
                message: 'Cita eliminada exitosamente'
            };
        }catch(error){
            return{
                success: false,
                message: 'Error al eliminar la cita: ' + error.message
            };
        }
    }

    generarFechasRecurrentes(configuracion) {
        const fechas = [];
        const { tipo_recurrencia, intervalo, dias_semana, fecha_inicio, fecha_fin, numero_ocurrencias } = configuracion;
        
        let fechaActual = new Date(fecha_inicio);
        let contador = 0;
        const maxOcurrencias = numero_ocurrencias || 365; // Límite de seguridad
        
        while (contador < maxOcurrencias) {
            // Si hay fecha_fin y ya la pasamos, salir
            if (fecha_fin && fechaActual > new Date(fecha_fin)) {
                break;
            }
            
            let agregarFecha = false;
            
            switch (tipo_recurrencia) {
                case 'diaria':
                    agregarFecha = true;
                    break;
                    
                case 'semanal':
                    // dias_semana es un string como "1,3,5" (lun, mie, vie)
                    // JavaScript: 0=domingo, 1=lunes, ... 6=sábado
                    const diasPermitidos = dias_semana ? dias_semana.split(',').map(d => parseInt(d)) : [];
                    const diaActual = fechaActual.getDay();
                    agregarFecha = diasPermitidos.includes(diaActual);
                    break;
                    
                case 'mensual':
                    // Mismo día del mes
                    agregarFecha = true;
                    break;
            }
            
            if (agregarFecha) {
                fechas.push(new Date(fechaActual));
                contador++;
                
                // Si llegamos al número de ocurrencias, salir
                if (numero_ocurrencias && contador >= numero_ocurrencias) {
                    break;
                }
            }
            
            // Avanzar al siguiente periodo
            switch (tipo_recurrencia) {
                case 'diaria':
                    fechaActual.setDate(fechaActual.getDate() + intervalo);
                    break;
                case 'semanal':
                    fechaActual.setDate(fechaActual.getDate() + 1); // Avanzar día a día
                    break;
                case 'mensual':
                    fechaActual.setMonth(fechaActual.getMonth() + intervalo);
                    break;
            }
        }
        
        return fechas;
    }

    /**
     * Crear cita recurrente con todas sus instancias
     */
    async crearCitaRecurrente(datosRecurrentes) {
        try {
            const {
                fkusuario,
                fkpaciente,
                horaatencion,
                comentario,
                transporte,
                fechatransporte,
                horariotransporte,
                direccion,
                tipo_recurrencia,
                intervalo,
                dias_semana,
                fecha_inicio,
                fecha_fin,
                numero_ocurrencias,
                usuariocreacion
            } = datosRecurrentes;
            
            // Validaciones
            if (!fkusuario || !fkpaciente || !horaatencion || !tipo_recurrencia || !fecha_inicio || !usuariocreacion) {
                return {
                    success: false,
                    message: 'Complete todos los campos requeridos'
                };
            }
            
            // Validar tipo de recurrencia
            if (!['diaria', 'semanal', 'mensual'].includes(tipo_recurrencia)) {
                return {
                    success: false,
                    message: 'Tipo de recurrencia inválido'
                };
            }
            
            // Si es semanal, validar días
            if (tipo_recurrencia === 'semanal' && !dias_semana) {
                return {
                    success: false,
                    message: 'Debe especificar los días de la semana'
                };
            }
            
            // Formatear hora
            let horaFormateada = horaatencion;
            if (horaatencion.split(':').length === 2) {
                horaFormateada = `${horaatencion}:00`;
            }
            const horaConvertida = new Date(`1970-01-01T${horaFormateada}Z`);
            
            // Generar fechas
            const fechas = this.generarFechasRecurrentes({
                tipo_recurrencia,
                intervalo: intervalo || 1,
                dias_semana,
                fecha_inicio,
                fecha_fin,
                numero_ocurrencias
            });
            
            if (fechas.length === 0) {
                return {
                    success: false,
                    message: 'No se generaron fechas válidas con la configuración proporcionada'
                };
            }
            
            // Verificar conflictos antes de crear
            const conflictos = await this.verificarConflictosRecurrentes(
                parseInt(fkusuario),
                parseInt(fkpaciente),
                fechas,
                horaConvertida
            );
            
            if (conflictos.length > 0) {
                return {
                    success: false,
                    message: `Se encontraron ${conflictos.length} conflictos de horario`,
                    conflictos: conflictos
                };
            }
            
            // Crear en una transacción
            const resultado = await prisma.$transaction(async (tx) => {
                // 1. Crear registro de agenda_recurrente
                const agendaRecurrente = await tx.agenda_recurrente.create({
                    data: {
                        fkusuario: parseInt(fkusuario),
                        fkpaciente: parseInt(fkpaciente),
                        horaatencion: horaConvertida,
                        comentario: comentario || null,
                        transporte: parseInt(transporte || 0),
                        fechatransporte:    this.convertirFecha(fechatransporte),
                        horariotransporte:  horariotransporte
                                        ? new Date(`1970-01-01T${horariotransporte}:00Z`)
                                        : null,
                        direccion: direccion || null,
                        tipo_recurrencia,
                        intervalo: parseInt(intervalo || 1),
                        dias_semana: dias_semana || null,
                        fecha_inicio: this.convertirFecha(fecha_inicio),
                        fecha_fin: fecha_fin ? this.convertirFecha(fecha_fin) : null,
                        numero_ocurrencias: numero_ocurrencias ? parseInt(numero_ocurrencias) : null,
                        usuariocreacion,
                        estado: 1
                    }
                });
                
                // 2. Crear todas las citas individuales
                const citasCreadas = await tx.agenda.createMany({
                    data: fechas.map(fecha => ({
                        fkusuario: parseInt(fkusuario),
                        fkpaciente: parseInt(fkpaciente),
                        fechaatencion: fecha,
                        horaatencion: horaConvertida,
                        comentario: comentario || null,
                        transporte: parseInt(transporte || 0),
                        fechatransporte:    this.convertirFecha(fechatransporte),
                        horariotransporte:  horariotransporte
                                        ? new Date(`1970-01-01T${horariotransporte}:00Z`)
                                        : null,
                        direccion: direccion || null,
                        usuariocreacion,
                        estado: 1,
                        fkagenda_recurrente: agendaRecurrente.idagenda_recurrente,
                        es_recurrente: true
                    }))
                });
                
                return {
                    agendaRecurrente,
                    totalCitas: citasCreadas.count
                };
            });
            
            return {
                success: true,
                message: `Citas recurrentes creadas exitosamente. Total: ${resultado.totalCitas}`,
                data: {
                    idagenda_recurrente: resultado.agendaRecurrente.idagenda_recurrente,
                    total_citas: resultado.totalCitas,
                    fechas: fechas.map(f => f.toISOString().split('T')[0])
                }
            };
            
        } catch (error) {
            return {
                success: false,
                message: 'Error al crear citas recurrentes: ' + error.message
            };
        }
    }

    /**
     * Verificar conflictos de horario para múltiples fechas
     */
    async verificarConflictosRecurrentes(fkusuario, fkpaciente, fechas, hora) {
        const conflictos = [];
        
        for (const fecha of fechas) {
            // Verificar conflicto del paciente
            const conflictoPaciente = await prisma.agenda.findFirst({
                where: {
                    fkpaciente: fkpaciente,
                    fechaatencion: fecha,
                    horaatencion: hora,
                    estado: { not: 0 }
                }
            });
            
            if (conflictoPaciente) {
                conflictos.push({
                    fecha: fecha.toISOString().split('T')[0],
                    tipo: 'paciente',
                    mensaje: 'Paciente ya tiene cita en esta fecha y hora'
                });
            }
            
            // Verificar conflicto del usuario/profesional
            const conflictoUsuario = await prisma.agenda.findFirst({
                where: {
                    fkusuario: fkusuario,
                    fechaatencion: fecha,
                    horaatencion: hora,
                    estado: { not: 0 }
                }
            });
            
            if (conflictoUsuario) {
                conflictos.push({
                    fecha: fecha.toISOString().split('T')[0],
                    tipo: 'profesional',
                    mensaje: 'Profesional ya tiene cita en esta fecha y hora'
                });
            }
        }
        
        return conflictos;
    }

    /**
     * Cancelar una cita individual de una serie recurrente
     */
    async cancelarCitaRecurrente(idagenda, usuariomodificacion) {
        try {
            const citaExistente = await prisma.agenda.findUnique({
                where: { idagenda: parseInt(idagenda) }
            });
            
            if (!citaExistente) {
                return {
                    success: false,
                    message: 'La cita no existe'
                };
            }
            
            if (!citaExistente.es_recurrente) {
                return {
                    success: false,
                    message: 'Esta no es una cita recurrente. Use eliminarCita()'
                };
            }
            
            // Cancelar solo esta cita
            await prisma.agenda.update({
                where: { idagenda: parseInt(idagenda) },
                data: {
                    estado: 0,
                    usuariomodificacion,
                    fechamodificacion: new Date()
                }
            });
            
            return {
                success: true,
                message: 'Cita cancelada exitosamente. Las demás citas de la serie no fueron afectadas'
            };
            
        } catch (error) {
            return {
                success: false,
                message: 'Error al cancelar cita: ' + error.message
            };
        }
    }

    /**
     * Cancelar toda la serie de citas recurrentes
     */
    async cancelarSerieCompleta(idagenda_recurrente, usuariomodificacion) {
        try {
            const resultado = await prisma.$transaction(async (tx) => {
                // Cancelar el registro recurrente
                await tx.agenda_recurrente.update({
                    where: { idagenda_recurrente: parseInt(idagenda_recurrente) },
                    data: {
                        estado: 0,
                        usuariomodificacion,
                        fechamodificacion: new Date()
                    }
                });
                
                // Cancelar todas las citas futuras de la serie
                const citasCanceladas = await tx.agenda.updateMany({
                    where: {
                        fkagenda_recurrente: parseInt(idagenda_recurrente),
                        fechaatencion: {
                            gte: new Date() // Solo futuras
                        },
                        estado: { not: 0 }
                    },
                    data: {
                        estado: 0,
                        usuariomodificacion,
                        fechamodificacion: new Date()
                    }
                });
                
                return citasCanceladas.count;
            });
            
            return {
                success: true,
                message: `Serie cancelada. ${resultado} citas futuras fueron canceladas`
            };
            
        } catch (error) {
            return {
                success: false,
                message: 'Error al cancelar serie: ' + error.message
            };
        }
    }

    async obtenerDetallesSerieRecurrente(idagenda_recurrente){
        try{
            const serie = await prisma.agenda_recurrente.findUnique({
                where: { idagenda_recurrente: parseInt(idagenda_recurrente) }
            });

            if(!serie){
                return{
                    success: false,
                    message: 'Serie recurrente no encontrada'
                };
            }

            return{
                success: true,
                data: serie
            };
        }catch(error){
            return{
                success: false,
                message: 'Error al obtener detalles de serie: ' + error.message
            };
        }
    }
}

module.exports = new AgendaService();