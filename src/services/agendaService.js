const { prisma } = require('../config/prisma');

class AgendaService{
    convertirFecha(fechaString) {
        if (!fechaString) return null;
        
        if (fechaString instanceof Date) return fechaString;
        
        const fecha = new Date(fechaString);
        
        if (isNaN(fecha.getTime())) {
            throw new Error(`Fecha inválida: ${fechaString}`);
        }
        
        return fecha;
    }

    async crearCita(agendaData, tx = null){
        try{
            const prismaClient = tx || prisma;

            const { fkusuario, fkpaciente, fechaatencion, horaatencion, comentario, transporte, fechatransporte, horariotransporte, direccion,
                    usuariocreacion, estado } = agendaData;

            if(!fkusuario || !fkpaciente || !fechaatencion || !horaatencion || !usuariocreacion){
                return{
                    success: false,
                    message: 'Complete los campos requeridos'
                };
            }

            let horaFormateada = horaatencion;

            if (horaatencion.split(':').length === 2) {
                horaFormateada = `${horaatencion}:00`;
            }

            const fechaConvertida = this.convertirFecha(fechaatencion);
            const horaConvertida = new Date(`1970-01-01T${horaFormateada}Z`);

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

            const profesional = await prisma.usuario.findUnique({
                where: { idusuario: parseInt(fkusuario) },
                select: { sesion_grupal: true }
            });

            if (!profesional?.sesion_grupal) {
                const citaExistenteUsuario = await prisma.agenda.findFirst({
                    where: {
                        fkusuario:     parseInt(fkusuario),
                        fechaatencion: fechaConvertida,
                        horaatencion:  horaConvertida,
                        estado: {
                            not: 0
                        }
                    }
                });

                if (citaExistenteUsuario) {
                    return {
                        success: false,
                        message: 'El profesional ya tiene cita programada en la fecha y hora seleccionada'
                    };
                }
            }

            const citaNueva = await prismaClient.agenda.create({
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
                data: citaNueva
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
                    estado: { 
                        in: [ 1,2,3 ]
                    }
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
            let fechaBusqueda = fecha;
            
            if (!fechaBusqueda) {
                const hoy = new Date();
                const offset = hoy.getTimezoneOffset();
                const fechaLocal = new Date(hoy.getTime() - (offset * 60 * 1000));
                fechaBusqueda = fechaLocal.toISOString().split('T')[0];
            }

            const citasConTransporte = await prisma.agenda.findMany({
                where: {
                    estado: 1,
                    transporte: 1,
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

    async actualizarCita(idagenda, agendaData, tx = null){
        try{
            const prismaClient = tx || prisma;

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

            if (horaatencion.split(':').length === 2) {
                horaFormateada = `${horaatencion}:00`;
            }

            const fechaConvertida = this.convertirFecha(fechaatencion);
            const horaConvertida = new Date(`1970-01-01T${horaFormateada}Z`);

            const citaExistentePaciente = await prisma.agenda.findFirst({
                where: {
                    fkpaciente:    parseInt(fkpaciente),
                    fechaatencion: fechaConvertida,
                    horaatencion:  horaConvertida,
                    estado: {
                        not: 0
                    },
                    idagenda: {
                        not: parseInt(idagenda)
                    }
                }
            });

            if(citaExistentePaciente){
                return{
                    success: false,
                    message: 'El paciente ya tiene cita programada en la fecha y hora seleccionada'
                };
            }

            const profesional = await prisma.usuario.findUnique({
                where: { idusuario: parseInt(fkusuario) },
                select: { sesion_grupal: true }
            });

            if (!profesional?.sesion_grupal) {
                const citaExistenteUsuario = await prisma.agenda.findFirst({
                    where: {
                        fkusuario:     parseInt(fkusuario),
                        fechaatencion: fechaConvertida,
                        horaatencion:  horaConvertida,
                        estado: {
                            not: 0
                        },
                        idagenda: {
                            not: parseInt(idagenda)
                        }
                    }
                });

                if (citaExistenteUsuario) {
                    return {
                        success: false,
                        message: 'El profesional ya tiene cita programada en la fecha y hora seleccionada'
                    };
                }
            }

            let horaTransporteFormateada = null;
            if (horariotransporte) {
                if (horariotransporte.split(':').length === 2) {
                    horaTransporteFormateada = `${horariotransporte}:00`;
                } else {
                    horaTransporteFormateada = horariotransporte;
                }
            }

            const citaActualizada = await prismaClient.agenda.update({
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

    async eliminarCita(idagenda, usuarioModificacion, tx = null){
        try{
            const prismaClient = tx || prisma;
            
            const citaExistente = await prisma.agenda.findUnique({
                where: { idagenda: parseInt(idagenda) }
            });

            if(!citaExistente){
                return{
                    success: false,
                    message: 'La cita no existe'
                };
            }
            
            // if(citaExistente.estado === 0){
            //     return{
            //         success: false,
            //         message: 'La cita ya está eliminada'
            //     };
            // }
            
            // const citaEliminada = await prismaClient.agenda.update({
            //     where: {
            //         idagenda: parseInt(idagenda)
            //     },
            //     data: {
            //         estado: 0,
            //         usuariomodificacion: usuarioModificacion
            //     }
            // });

            await prismaClient.agenda.delete({
                where: { idagenda: parseInt(idagenda) }
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
        
        const [año, mes, dia] = fecha_inicio.split('-').map(Number);
        let fechaActual = new Date(año, mes - 1, dia);

        const maxOcurrencias = numero_ocurrencias || 365;

        let fechaFinObj = null;
        if (fecha_fin) {
            const [añoFin, mesFin, diaFin] = fecha_fin.split('-').map(Number);
            fechaFinObj = new Date(añoFin, mesFin - 1, diaFin);
        }

        if (tipo_recurrencia === 'semanal') {

            const diasPermitidos = dias_semana
                ? dias_semana.split(',').map(d => parseInt(d))
                : [];

            const diaSemanaInicio = fechaActual.getDay(); 
            const inicioSemana = new Date(fechaActual);
            const diasHastaLunes = diaSemanaInicio === 0 ? -6 : 1 - diaSemanaInicio;
            inicioSemana.setDate(inicioSemana.getDate() + diasHastaLunes);

            let semanaActual = new Date(inicioSemana);

            while (fechas.length < maxOcurrencias) {
                
                for (let d = 0; d < 7; d++) {
                    const diaRevision = new Date(semanaActual);
                    diaRevision.setDate(semanaActual.getDate() + d);
                    
                    if (diaRevision < fechaActual) continue;
                    
                    if (fechaFinObj && diaRevision > fechaFinObj) return fechas;
                    
                    if (diasPermitidos.includes(diaRevision.getDay())) {
                        fechas.push(new Date(
                            diaRevision.getFullYear(),
                            diaRevision.getMonth(),
                            diaRevision.getDate()
                        ));

                        if (fechas.length >= maxOcurrencias) return fechas;
                    }
                }
                
                semanaActual.setDate(semanaActual.getDate() + (7 * intervalo));
                
                if (fechaFinObj && semanaActual > fechaFinObj) break;
            }

        } else {
            
            while (fechas.length < maxOcurrencias) {
                if (fechaFinObj && fechaActual > fechaFinObj) break;

                fechas.push(new Date(
                    fechaActual.getFullYear(),
                    fechaActual.getMonth(),
                    fechaActual.getDate()
                ));

                switch (tipo_recurrencia) {
                    case 'diaria':
                        fechaActual.setDate(fechaActual.getDate() + intervalo);
                        break;
                    case 'mensual':
                        fechaActual.setMonth(fechaActual.getMonth() + intervalo);
                        break;
                }
            }
        }

        return fechas;
    }

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
            
            if (!fkusuario || !fkpaciente || !horaatencion || !tipo_recurrencia || !fecha_inicio || !usuariocreacion) {
                return {
                    success: false,
                    message: 'Complete todos los campos requeridos'
                };
            }
            
            if (!['diaria', 'semanal', 'mensual'].includes(tipo_recurrencia)) {
                return {
                    success: false,
                    message: 'Tipo de recurrencia inválido'
                };
            }
            
            if (tipo_recurrencia === 'semanal' && !dias_semana) {
                return {
                    success: false,
                    message: 'Debe especificar los días de la semana'
                };
            }
            
            let horaFormateada = horaatencion;
            if (horaatencion.split(':').length === 2) {
                horaFormateada = `${horaatencion}:00`;
            }
            const horaConvertida = new Date(`1970-01-01T${horaFormateada}Z`);
            
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
            
            const resultado = await prisma.$transaction(async (tx) => {

                const fechaInicioObj = new Date(fecha_inicio + 'T00:00:00.000Z');

                let fechaFinObj = null;
                if (fecha_fin) {
                    fechaFinObj = new Date(fecha_fin + 'T00:00:00.000Z');
                } else if (fechas.length > 0) {
                    const ultimaFecha = fechas[fechas.length - 1];
                    const y = ultimaFecha.getFullYear();
                    const m = String(ultimaFecha.getMonth() + 1).padStart(2, '0');
                    const d = String(ultimaFecha.getDate()).padStart(2, '0');
                    fechaFinObj = new Date(`${y}-${m}-${d}T00:00:00.000Z`);
                }
                
                const agendaRecurrente = await tx.agenda_recurrente.create({
                    data: {
                        fkusuario: parseInt(fkusuario),
                        fkpaciente: parseInt(fkpaciente),
                        horaatencion: horaConvertida,
                        comentario: comentario || null,
                        transporte: parseInt(transporte || 0),
                        fechatransporte: parseInt(transporte || 0) ? fechaInicioObj : null,
                        horariotransporte:  horariotransporte
                                        ? new Date(`1970-01-01T${horariotransporte}:00Z`)
                                        : null,
                        direccion: direccion || null,
                        tipo_recurrencia,
                        intervalo: parseInt(intervalo || 1),
                        dias_semana: dias_semana || null,
                        fecha_inicio: fechaInicioObj,
                        fecha_fin: fechaFinObj,
                        numero_ocurrencias: numero_ocurrencias ? parseInt(numero_ocurrencias) : null,
                        usuariocreacion,
                        estado: 1
                    }
                });
                
                const citasCreadas = await tx.agenda.createMany({
                    data: fechas.map(fecha => ({
                        fkusuario: parseInt(fkusuario),
                        fkpaciente: parseInt(fkpaciente),
                        fechaatencion: fecha,
                        horaatencion: horaConvertida,
                        comentario: comentario || null,
                        transporte: parseInt(transporte || 0),
                        fechatransporte: parseInt(transporte || 0) ? fecha : null,
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

    async verificarConflictosRecurrentes(fkusuario, fkpaciente, fechas, hora) {
        const conflictos = [];
        
        for (const fecha of fechas) {
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

    async cancelarCitaRecurrente(idagenda, usuariomodificacion, tx = null) {
        try {
            const prismaClient = tx || prisma;
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
            
            await prismaClient.agenda.update({
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

    async cancelarSerieCompleta(idagenda_recurrente, usuariomodificacion) {
        try {
            const resultado = await prisma.$transaction(async (tx) => {
                await tx.agenda_recurrente.update({
                    where: { idagenda_recurrente: parseInt(idagenda_recurrente) },
                    data: {
                        estado: 0,
                        usuariomodificacion,
                        fechamodificacion: new Date()
                    }
                });
                
                const citasCanceladas = await tx.agenda.updateMany({
                    where: {
                        fkagenda_recurrente: parseInt(idagenda_recurrente),
                        fechaatencion: {
                            gte: new Date()
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

            const serieFormateada = {
                ...serie,
                fecha_inicio: serie.fecha_inicio 
                    ? serie.fecha_inicio.toISOString().split('T')[0] 
                    : null,
                fecha_fin: serie.fecha_fin 
                    ? serie.fecha_fin.toISOString().split('T')[0] 
                    : null
            };

            return{
                success: true,
                data: serieFormateada
            };
        }catch(error){
            return{
                success: false,
                message: 'Error al obtener detalles de serie: ' + error.message
            };
        }
    }
    
    async actualizarEstadoCita(idagenda, estado, comentario, usuariomodificacion) {
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

            if (citaExistente.estado === 0) {
                return {
                    success: false,
                    message: 'No se puede actualizar el estado de una cita eliminada'
                };
            }

            const estadosPermitidos = [2, 3];
            if (!estadosPermitidos.includes(parseInt(estado))) {
                return {
                    success: false,
                    message: 'Estado inválido. Use 2 (confirmada) o 3 (no se presentó)'
                };
            }

            const citaActualizada = await prisma.agenda.update({
                where: { idagenda: parseInt(idagenda) },
                data: {
                    estado:              parseInt(estado),
                    comentario:          comentario || citaExistente.comentario,
                    usuariomodificacion: usuariomodificacion,
                    fechamodificacion:   new Date()
                },
                select: {
                    idagenda:  true,
                    estado:    true,
                    comentario: true
                }
            });

            const mensajes = {
                2: 'Asistencia confirmada correctamente',
                3: 'Inasistencia registrada correctamente'
            };

            return {
                success: true,
                message: mensajes[parseInt(estado)],
                data: citaActualizada
            };

        } catch (error) {
            return {
                success: false,
                message: 'Error al actualizar el estado de la cita: ' + error.message
            };
        }
    }
}

module.exports = new AgendaService();