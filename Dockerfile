FROM node:18-slim

# Installa Chromium e dipendenze
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libgbm1 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia package.json e yarn.lock
COPY package.json yarn.lock ./

# Installa dipendenze (incluse quelle di dev per la build)
RUN yarn install --frozen-lockfile

# Copia il codice sorgente
COPY . .

# Compila TypeScript
RUN yarn build

# Rimuovi le dev dependencies per ridurre dimensione
RUN yarn install --production --frozen-lockfile

# Configurazione Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

CMD ["node", "dist/bot.js"]