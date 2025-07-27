const bcrypt = require('bcryptjs');                      //para encriptar contraseñas
const { PrismaClient } = require('../generated/prisma'); // ORM que sirve para conectar con base de datos
const { generarToken } = require('../utils/jwt');        // función para crear token

const prisma = new PrismaClient();

class AuthService{
    async login(usuario_, clave_){
        try{
            //Buscar usuario por email
            const usuario = await prisma.usuario.findUnique({ 
                where: {
                    usuario: usuario_.toLowerCase().trim()
                },
                select:{
                    idusuario:      true,
                    usuario:        true,
                    nombres:        true,
                    apellidos:      true,
                    puesto:         true,
                    rutafotoperfil: true,
                    fkrol:          true,
                    estado:         true,
                    clave:          true
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
                id:       usuario.idusuario,
                usuario:  usuario.usuario,
                nombre:   usuario.nombres,
                apellido: usuario.apellidos
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