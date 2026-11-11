# back-cmi/Dockerfile
# Node + Express + Prisma (sin paso de compilación, JS plano).
FROM node:20-bookworm-slim

# OpenSSL es requerido por los motores de Prisma en Debian/Ubuntu.
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Dependencias primero (aprovecha la caché de capas de Docker)
COPY package*.json ./
RUN npm ci

# Prisma: generar el cliente para la plataforma real del contenedor.
# El cliente generado localmente (src/generated/prisma) NO se copia desde
# el host - ver .dockerignore - se regenera aquí siempre.
COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

ENV NODE_ENV=production
EXPOSE 3000

# Al iniciar: aplica migraciones pendientes y luego arranca el servidor.
# Si "migrate deploy" falla (ej. drift de la base), el contenedor no
# arranca a medias - se ve de inmediato en los logs de Docker.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
