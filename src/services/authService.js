const bcrypt = require('bcryptjs');                      //para encriptar contraseñas
const { PrismaClient } = require('../generated/prisma'); // ORM que sirve para conectar con base de datos
const { generarToken } = require('../utils/jwt');        // función para crear token

const prisma = new PrismaClient();

class AuthService{
    async login(correo_, clave_){
        try{
            //Buscar usuario por email
            const usuario = await prisma.usuario.findUnique({ 
                where: {
                    correo: correo_.toLowerCase().trim()
                }
            });

            if(!usuario){
                throw new Error('Credenciales inválidas');
            }

            //Verifica si el usuario esta activo
            if(!usuario.estado){
                throw new Error('Usuario inactivo. Contacte al administrador');
            }

            //verifica la contraseña
            const passValida = await bcrypt.compare(clave_, usuario.clave);

            if(!passValida){
                throw new Error('Credenciales inválidas');
            }

            //Genera el token 
            const token = generarToken({
                id: usuario.id,
                correo: usuario.correo,
                nombre: usuario.nombre
            });

            //Retornar datos (sin la contraseña)
            const { clave: _, ...usuarioSinClave } = usuario;
            
            return {
                usuario: usuarioSinClave,
                token
            };
        }catch(error){
            console.error('Error en AuthService.login:', error.message);
            throw error;
        }
    }
}

module.exports = new AuthService();