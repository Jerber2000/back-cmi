const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');
const { generarToken } = require('../utils/jwt');
const sessionTracker = require('../utils/sessionTracker');

// Rutas de permiso que habilitan doble sesión (PC + celular), pensado para
// quienes usan el escaneo de código de barras desde el teléfono sin perder
// su sesión de escritorio.
const RUTAS_PERMISO_DOBLE_SESION = ['inventario', 'salida-inventario'];
const MAX_SESIONES_DOBLE = 2;
const MAX_SESIONES_DEFAULT = 1;

class AuthService{

    // Cuántas sesiones simultáneas puede tener un rol. Roles con acceso a
    // Inventario o Salidas de Inventario obtienen 2 (PC + celular); el resto
    // mantiene el límite de 1 sesión de siempre.
    async obtenerLimiteSesiones(fkrol) {
        try {
            const permisosDelRol = await prisma.rol_permiso.findMany({
                where: { fkrol },
                include: { permiso: { select: { ruta: true } } }
            });

            const tieneAccesoInventario = permisosDelRol.some(rp =>
                RUTAS_PERMISO_DOBLE_SESION.includes(rp.permiso.ruta)
            );

            return tieneAccesoInventario ? MAX_SESIONES_DOBLE : MAX_SESIONES_DEFAULT;
        } catch (error) {
            console.error('Error en AuthService.obtenerLimiteSesiones:', error.message);
            return MAX_SESIONES_DEFAULT;
        }
    }
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

            // VERIFICAR LÍMITE DE SESIONES ACTIVAS (depende del rol: ver
            // obtenerLimiteSesiones - por defecto 1, pero 2 para roles con
            // acceso a Inventario/Salidas, para permitir PC + celular)
            const limiteSesiones = await this.obtenerLimiteSesiones(usuario.fkrol);
            const sesionesActivas = sessionTracker.contarActivas(usuario.idusuario);

            if (sesionesActivas >= limiteSesiones) {
                throw new Error(
                    limiteSesiones > 1
                        ? `Ya alcanzaste el máximo de ${limiteSesiones} sesiones activas simultáneas. ` +
                          `Cierra sesión en alguno de tus dispositivos, o usa "Olvidé mi contraseña" para resetear tu acceso.`
                        : `Ya tienes una sesión activa en otro dispositivo. ` +
                          `Cierra sesión en el otro dispositivo o usa "Olvidé mi contraseña" para resetear tu acceso.`
                );
            }

            const timestamp = Date.now();

            const token = generarToken({
                id:             usuario.idusuario,
                usuario:        usuario.usuario,
                nombre:         usuario.nombres,
                apellido:       usuario.apellidos,
                rutafotoperfil: usuario.rutafotoperfil,
                fkrol:          usuario.fkrol,
                timestamp:      timestamp
            });

            sessionTracker.registrarSesion(usuario.idusuario, timestamp);

            // Se mantiene solo como dato informativo (última vez que alguien
            // inició sesión); el bloqueo real ahora lo controla sessionTracker.
            await prisma.usuario.update({
                where: { idusuario: usuario.idusuario },
                data: {
                    last_login_timestamp: BigInt(timestamp)
                }
            });

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

    async verificarSesionActiva(idusuario_, timestamp_) {
        try {
            const usuario = await prisma.usuario.findUnique({
                where: { idusuario: idusuario_ },
                select: { estado: true }
            });

            if (!usuario || !usuario.estado) {
                return false;
            }

            // El token es válido solo si SU sesión específica (identificada
            // por el timestamp con el que se generó) sigue registrada como
            // activa. Esto permite que, para roles con doble sesión, cada
            // dispositivo tenga su propia sesión independiente sin invalidar
            // la del otro.
            return sessionTracker.existeSesion(idusuario_, timestamp_);
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

            const claveValida = await bcrypt.compare(claveActual_, usuario.clave);
            if (!claveValida) {
                throw new Error('Contraseña actual incorrecta');
            }

            const mismaClaveAnterior = await bcrypt.compare(claveNueva_, usuario.clave);
            if (mismaClaveAnterior) {
                throw new Error('La nueva contraseña debe ser diferente a la temporal');
            }

            if (claveNueva_.length < 8 || claveNueva_.length > 12) {
                throw new Error('La contraseña debe tener entre 8 y 12 caracteres');
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
            if (!passwordRegex.test(claveNueva_)) {
                throw new Error('La contraseña debe contener al menos: una mayúscula, una minúscula, un número y un símbolo');
            }

            const hashNuevaClave = await bcrypt.hash(claveNueva_, 10);

            await prisma.usuario.update({
                where: { 
                    idusuario: usuario.idusuario
                },
                data: {
                    clave: hashNuevaClave,
                    cambiarclave: false
                },
                select: {
                    idusuario: true
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

    async cerrarSesion(idusuario_, timestamp_) {
        try {
            // Elimina únicamente la sesión de ESTE dispositivo/token. Si el
            // usuario tiene doble sesión (PC + celular), la otra sigue activa.
            sessionTracker.eliminarSesion(idusuario_, timestamp_);
            return true;
        } catch (error) {
            console.error('Error en AuthService.cerrarSesion:', error.message);
            return false;
        }
    }

    async refreshToken(usuarioPayload) {
        // Verificar que el usuario sigue activo
        const usuario = await prisma.usuario.findUnique({
            where: { idusuario: usuarioPayload.id || usuarioPayload.idusuario },
            include: { rol: { select: { idrol: true, nombre: true } } }
        });

        if (!usuario || usuario.estado !== 1) {
            throw new Error('Usuario no encontrado o inactivo');
        }

        const nuevoTimestamp = Date.now();

        const nuevoToken = generarToken({
            id: usuario.idusuario,
            usuario: usuario.usuario,
            nombre: usuario.nombres,
            rol: usuario.rol?.idrol,
            rolNombre: usuario.rol?.nombre,
            fkclinica: usuario.fkclinica,
            timestamp: nuevoTimestamp
        });

        // Reemplaza la sesión vieja (la de este mismo dispositivo) por la
        // nueva, sin sumar al conteo de sesiones simultáneas.
        sessionTracker.eliminarSesion(usuario.idusuario, usuarioPayload.timestamp);
        sessionTracker.registrarSesion(usuario.idusuario, nuevoTimestamp);

        return nuevoToken;
    }
}

module.exports = new AuthService();