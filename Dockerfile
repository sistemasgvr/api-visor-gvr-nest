# Stage 1: Build (Alpine: imagen ligera; no se ejecuta Puppeteer aquí)
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Evita descargar Chrome en el build (no hace falta para compilar)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Compilar la aplicación
RUN npm run build

# Stage 2: Production — Debian slim + Chromium del sistema (Puppeteer no funciona bien en Alpine/musl)
FROM node:20-bookworm-slim

WORKDIR /usr/src/app

# Chromium y dependencias mínimas para headless PDF (Puppeteer en Docker)
RUN apt-get update && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxkbcommon0 \
    libxrandr2 \
    && rm -rf /var/lib/apt/lists/*

# Usar el Chromium del SO; no descargar el bundle de Puppeteer (incompatible o ausente en contenedor)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm ci --only=production

# Copiar el build desde el stage anterior
COPY --from=builder /usr/src/app/dist ./dist

# Exponer el puerto
EXPOSE 4001

CMD ["node", "dist/main.js"]
