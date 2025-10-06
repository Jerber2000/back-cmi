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

            const citaNueva = await prisma.agenda.create({
                data:{
                    fkusuario:          parseInt(fkusuario),
                    fkpaciente:         parseInt(fkpaciente),
                    fechaatencion:      this.convertirFecha(fechaatencion),
                    horaatencion:       new Date(`1970-01-01T${horaFormateada}Z`),
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
                message: 'Cita creado exitosamente',
                data: agendaData
            };
        }catch(error){
            console.error("Error al crear una cita en el service: ", error.message);
            throw error;
        }
    }
}

module.exports = new AgendaService();