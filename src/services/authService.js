const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');
const { generarToken } = require('../utils/jwt');

class AuthService{
    async login(usuario_, clave_){
        try{
            //Buscar usuario por email
            const usuario = await prisma.usuario.findUnique({ 
                where: {
                    usuario: usuario_.toLowerCase().trim()
                },
                include: {
                    rol: { 
                        select: {
                            idrol: true,
                            nombre: true
                        }
                    }
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

            // ✅ VERIFICAR SI YA HAY UNA SESIÓN ACTIVA
            if (usuario.last_login_timestamp) {
                const timestampBD = Number(usuario.last_login_timestamp);
                const ahora = Date.now();
                const tiempoTranscurrido = ahora - timestampBD;
                
                // Tiempo de expiración en milisegundos (8 horas = 28800000 ms)
                const horasExpiracion = parseInt(process.env.JWT_EXPIRES_IN) || 3;
                const TIEMPO_EXPIRACION = horasExpiracion * 60 * 60 * 1000;
                
                // Si la sesión aún no ha expirado, bloquear el login
                if (tiempoTranscurrido < TIEMPO_EXPIRACION) {
                    const tiempoRestante = TIEMPO_EXPIRACION - tiempoTranscurrido;
                    const horasRestantes = Math.floor(tiempoRestante / (60 * 60 * 1000));
                    const minutosRestantes = Math.floor((tiempoRestante % (60 * 60 * 1000)) / (60 * 1000));
                    
                    throw new Error(
                        `Ya tienes una sesión activa en otro dispositivo. ` +
                        `Por favor, cierra sesión en el otro dispositivo`
                    );
                }
            }

            // ✅ GENERAR TIMESTAMP ÚNICO para esta sesión
            const timestamp = Date.now();

            //Genera el token con el timestamp
            const token = generarToken({
                id:             usuario.idusuario,
                usuario:        usuario.usuario,
                nombre:         usuario.nombres,
                apellido:       usuario.apellidos,
                rutafotoperfil: usuario.rutafotoperfil,
                fkrol:          usuario.fkrol,
                timestamp:      timestamp  // ← Timestamp único de esta sesión
            });

            // ✅ GUARDAR el timestamp en la base de datos
            // Esto invalida cualquier token anterior
            await prisma.usuario.update({
                where: { idusuario: usuario.idusuario },
                data: { 
                    last_login_timestamp: BigInt(timestamp)
                }
            });

            //Retornar datos (sin la contraseña y sin el timestamp que es BigInt)
            const { clave: _, last_login_timestamp, ...usuarioSinClave } = usuario;
            
            return {
                usuario: {
                    ...usuarioSinClave,
                    rolNombre: usuario.rol.nombre
                },
                token,
                cambiarclave: usuario.cambiarclave
            };
        }catch(error){
            console.error('Error en AuthService.login:', error.message);
            throw error;
        }
    }

    // ✅ NUEVO: Verificar si el timestamp del token coincide con el guardado en BD
    async verificarSesionActiva(idusuario_, timestamp_) {
        try {
            const usuario = await prisma.usuario.findUnique({
                where: { idusuario: idusuario_ },
                select: { 
                    last_login_timestamp: true,
                    estado: true 
                }
            });

            if (!usuario || !usuario.estado) {
                return false;
            }

            // Comparar timestamps (convertir BigInt a Number para comparación)
            const timestampBD = usuario.last_login_timestamp 
                ? Number(usuario.last_login_timestamp) 
                : null;

            if (!timestampBD || timestampBD !== timestamp_) {
                return false; // Token desactualizado o no existe
            }

            return true;
        } catch (error) {
            console.error('Error en AuthService.verificarSesionActiva:', error.message);
            return false;
        }
    }

    async cambiarClaveObligatoria(usuario_, claveActual_, claveNueva_) {
        try {
            const usuario = await prisma.usuario.findUnique({
                where: {
                    usuario: usuario_.toLowerCase().trim()
                }
            });

            if (!usuario) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar que el usuario debe cambiar su contraseña
            if (!usuario.cambiarclave) {
                throw new Error('No es necesario cambiar la contraseña');
            }

            // Verificar la contraseña actual (temporal)
            const claveValida = await bcrypt.compare(claveActual_, usuario.clave);
            if (!claveValida) {
                throw new Error('Contraseña actual incorrecta');
            }

            // Validar que la nueva contraseña no sea igual a la temporal
            const mismaClaveAnterior = await bcrypt.compare(claveNueva_, usuario.clave);
            if (mismaClaveAnterior) {
                throw new Error('La nueva contraseña debe ser diferente a la temporal');
            }

            // Validar formato de la nueva contraseña
            if (claveNueva_.length < 8 || claveNueva_.length > 12) {
                throw new Error('La contraseña debe tener entre 8 y 12 caracteres');
            }

            // Validar complejidad de la contraseña (opcional)
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
            if (!passwordRegex.test(claveNueva_)) {
                throw new Error('La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un símbolo');
            }

            // Hashear la nueva contraseña
            const hashNuevaClave = await bcrypt.hash(claveNueva_, 10);

            // Actualizar la contraseña y desactivar el flag
            await prisma.usuario.update({
                where: { usuario: usuario_ },
                data: {
                    clave: hashNuevaClave,
                    cambiarclave: false // Desactivar el cambio obligatorio
                }
            });

            return { 
                success: true, 
                message: 'Contraseña actualizada correctamente' 
            };

        } catch (error) {
            console.error('Error en AuthService.cambiarClaveObligatoria:', error.message);
            throw error;
        }
    }

    async verificarCambioClave(usuario_) {
        try {
            const usuario = await prisma.usuario.findUnique({
                where: { usuario: usuario_ },
                select: { cambiarclave: true }
            });

            return usuario ? usuario.cambiarclave : false;
        } catch (error) {
            console.error('Error en AuthService.verificarCambioClave:', error.message);
            return false;
        }
    }

    // ✅ NUEVO: Cerrar sesión (limpiar timestamp)
    async cerrarSesion(idusuario_) {
        try {
            await prisma.usuario.update({
                where: { idusuario: idusuario_ },
                data: {
                    last_login_timestamp: null
                }
            });
            return true;
        } catch (error) {
            console.error('Error en AuthService.cerrarSesion:', error.message);
            return false;
        }
    }
}

module.exports = new AuthService();