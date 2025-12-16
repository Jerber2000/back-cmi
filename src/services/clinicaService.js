const { prisma } = require('../config/prisma');

class ClinicaService{
    async consultarClinica(){
        try{
            const clinica = await prisma.clinica.findMany({
                select:{
                    idclinica:     true,
                    nombreclinica: true
                },
                where:{
                    estado: 1
                },
                orderBy:{
                    nombreclinica: 'asc'
                }
            });

            return{
                success: true,
                data: clinica
            };
        }catch(error){
            console.error("Error en clinicaService: ", error.message);
            throw error;
        }
    }
}

module.exports = new ClinicaService();
