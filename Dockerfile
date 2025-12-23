FROM node:18-slim

# Installa Chromium e dipendenze necessarie
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    fonts-noto-color-emoji \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgbm1 \
    libxshmfence1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libasound2 \
    libatk1.0-0 \
    libatspi2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgtk-3-0 \
    libnspr4 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Step 1: Copia i file di configurazione delle dipendenze
COPY package.json yarn.lock ./

# Step 2: Installa le dipendenze
RUN yarn install --frozen-lockfile

# Step 3: Copia il resto del codice (IMPORTANTE: questo deve venire DOPO yarn install)
COPY tsconfig.json ./
COPY src ./src

# Step 4: Compila TypeScript (ora src/ esiste!)
RUN yarn build

# Verifica che la compilazione sia riuscita
RUN ls -la dist/ && test -f dist/bot.js

# Configurazione Puppeteer per usare Chromium di sistema
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Avvia il bot
CMD ["node", "dist/bot.js"]