const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { prisma } = require('../config/prisma');

const transporte = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

const EnviarClaveReseteada = async (email_, tempClave_, nombreUsuario_) => {
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperación de Contraseña</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #00c99c 0%, #00a085 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: 300;
            }
            .header .icon {
                font-size: 48px;
                margin-bottom: 15px;
            }
            .content {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            .message {
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 30px;
                color: #555;
            }
            .password-box {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border: 2px dashed #6c757d;
                border-radius: 8px;
                padding: 25px;
                text-align: center;
                margin: 30px 0;
            }
            .password-label {
                font-size: 14px;
                color: #6c757d;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .password {
                font-size: 24px;
                font-weight: bold;
                color: #495057;
                font-family: 'Courier New', monospace;
                background-color: #ffffff;
                padding: 15px;
                border-radius: 6px;
                border: 1px solid #dee2e6;
                margin: 10px 0;
                user-select: all;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 6px;
                padding: 20px;
                margin: 25px 0;
            }
            .warning-icon {
                color: #856404;
                font-size: 20px;
                margin-right: 10px;
            }
            .warning-text {
                color: #856404;
                margin: 0;
                font-size: 14px;
            }
            .steps {
                background-color: #f8f9fa;
                border-radius: 8px;
                padding: 25px;
                margin: 25px 0;
            }
            .steps h3 {
                color: #495057;
                margin-top: 0;
                margin-bottom: 20px;
            }
            .step {
                display: flex;
                align-items: flex-start;
                margin-bottom: 15px;
            }
            .step-number {
                background-color: #007bff;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
                margin-right: 15px;
                flex-shrink: 0;
            }
            .step-text {
                font-size: 14px;
                color: #555;
            }
            .footer {
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #dee2e6;
            }
            .footer p {
                margin: 0;
                font-size: 14px;
                color: #6c757d;
            }
            .company-info {
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #dee2e6;
            }
            .company-name {
                font-weight: bold;
                color: #495057;
                font-size: 16px;
            }
            .security-note {
                background-color: #d1ecf1;
                border: 1px solid #bee5eb;
                border-radius: 6px;
                padding: 15px;
                margin: 20px 0;
                font-size: 13px;
                color: #0c5460;
            }
            .security-note ul {
                margin: 10px 0;
                padding-left: 20px;
            }
            .security-note li {
                margin-bottom: 5px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="icon">🔐</div>
                <h1>Recuperación de Contraseña</h1>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Hola <strong>${nombreUsuario_}</strong>,
                </div>
                
                <div class="message">
                    Hemos recibido una solicitud para restablecer tu contraseña. Como medida de seguridad, hemos generado una contraseña temporal para tu cuenta.
                </div>
                
                <div class="password-box">
                    <div class="password-label">Tu contraseña temporal es:</div>
                    <div class="password">${tempClave_}</div>
                </div>
                
                <div class="warning">
                    <span class="warning-icon">⚠️</span>
                    <p class="warning-text">
                        <strong>Importante:</strong> Por tu seguridad, deberás cambiar esta contraseña temporal inmediatamente después de iniciar sesión.
                    </p>
                </div>
                
                <div class="steps">
                    <h3>Pasos a seguir:</h3>
                    <p style="font-size: 14px; color: #555; margin-bottom: 15px;">
                        <strong style="display: inline-block; background-color: #007bff; color: white; width: 20px; height: 20px; border-radius: 50%; text-align: center; font-size: 12px; line-height: 20px; margin-right: 10px;">1</strong>
                        Inicia sesión con tu usuario y la contraseña temporal mostrada arriba
                    </p>
                    <p style="font-size: 14px; color: #555; margin-bottom: 15px;">
                        <strong style="display: inline-block; background-color: #007bff; color: white; width: 20px; height: 20px; border-radius: 50%; text-align: center; font-size: 12px; line-height: 20px; margin-right: 10px;">2</strong>
                        El sistema te pedirá que cambies tu contraseña inmediatamente
                    </p>
                    <p style="font-size: 14px; color: #555; margin-bottom: 15px;">
                        <strong style="display: inline-block; background-color: #007bff; color: white; width: 20px; height: 20px; border-radius: 50%; text-align: center; font-size: 12px; line-height: 20px; margin-right: 10px;">3</strong>
                        Crea una nueva contraseña segura que solo tú conozcas
                    </p>
                    <p style="font-size: 14px; color: #555; margin-bottom: 15px;">
                        <strong style="display: inline-block; background-color: #007bff; color: white; width: 20px; height: 20px; border-radius: 50%; text-align: center; font-size: 12px; line-height: 20px; margin-right: 10px;">4</strong>
                        Confirma tu nueva contraseña y guárdala en un lugar seguro
                    </p>
                </div>
                
                <div class="security-note">
                    <strong>Consejos de seguridad:</strong>
                    <ul>
                        <li>Tu nueva contraseña debe tener al menos 8 caracteres y maximo 12 caracteres</li>
                        <li>Incluye mayúsculas, minúsculas, números y símbolos</li>
                        <li>No compartas tu contraseña con nadie</li>
                        <li>Usa una contraseña única para cada cuenta</li>
                    </ul>
                </div>
                
                <div class="message">
                    Si no solicitaste este cambio de contraseña, por favor contacta inmediatamente a nuestro equipo de soporte.
                </div>
            </div>
            
            <div class="footer">
                <div class="company-info">
                    <div class="company-name">${process.env.NOMBRE_EMPRESA || 'Tu Empresa'}</div>
                    <p>Equipo de Soporte Técnico</p>
                </div>
                <p style="margin-top: 20px;">
                    Este es un mensaje automático, por favor no respondas a este correo.
                </p>
                <p style="margin-top: 10px; font-size: 12px;">
                    © ${new Date().getFullYear()} ${process.env.NOMBRE_EMPRESA || 'Tu Empresa'}. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
    const mailOptions = {
        from: {
            name: process.env.NOMBRE_EMPRESA,
            address: process.env.EMAIL_USER
        },
        to: email_,
        subject: 'Recuperación de contraseña',
        html: htmlTemplate,
        text: `
        Hola ${nombreUsuario_},
        
        Tu contraseña temporal es: ${tempClave_}
        
        Por favor, inicia sesión y cambia tu contraseña inmediatamente.
        
        Pasos a seguir:
        1. Inicia sesión con tu correo y la contraseña temporal
        2. El sistema te pedirá cambiar tu contraseña
        3. Crea una nueva contraseña segura
        4. Confirma tu nueva contraseña
        
        Si no solicitaste este cambio, contacta a soporte.
        
        Saludos,
        Equipo de ${process.env.NOMBRE_EMPRESA}
        `
    };
    return await transporte.sendMail(mailOptions);
};

const ResetearClave = async (correo_) => {
    try{
        const usuario = await prisma.usuario.findUnique({
            where:{
                correo: correo_.toLowerCase().trim()
            }
        });

        if(!usuario){
            throw new Error('Credenciales inválidas');
        }

        if(!usuario.estado){
            throw new Error('Usuario inactivo. Contacte al administrador');
        }

        const tempPass = Math.random().toString(36).slice(-8);
        const hashPass = await bcrypt.hash(tempPass, 10);

        await prisma.usuario.update({
            where: { correo: correo_ },
            data: {
                clave: hashPass,
                cambiarclave: true,
                last_login_timestamp: null
            }
        });

        await EnviarClaveReseteada(correo_, tempPass, usuario.nombres);

        return { 
            success: true, 
            message: 'Contraseña temporal enviada al correo' 
        };

    }catch(error){
        console.error('Error en EmailService.ResetearClave:', error.message);
        throw error;
    }
};

module.exports = {
    ResetearClave
};