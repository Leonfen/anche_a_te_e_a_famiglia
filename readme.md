# WhatsApp Bot Auguri con Ollama AI

Bot automatico per WhatsApp che risponde ai messaggi di auguri con una risposta predefinita e utilizza Ollama AI per gestire altri tipi di messaggi.

## Caratteristiche

- **Risposta automatica agli auguri**: Risponde automaticamente a messaggi contenenti parole chiave come "auguri", "buon natale", "buon anno", ecc.
- **Integrazione Ollama**: Utilizza modelli AI locali (Ollama) per rispondere a messaggi generici
- **Blacklist intelligente**: Esclude chat specifiche per ID o per nome (supporta substring matching)
- **Docker ready**: Completamente containerizzato con Docker Compose
- **Sessione persistente**: Mantiene l'autenticazione WhatsApp tra riavvii

## Come funziona

Il bot analizza ogni messaggio in arrivo e:

1. **Ignora** messaggi da chat nella blacklist (per ID o nome contenente substring)
2. **Se contiene auguri** risponde con "Auguri anche a te e famiglia!"
3. **Altrimenti** (se Ollama è abilitato) usa AI per distinguere un augurio da un messaggio normale

## Prerequisiti

### Per esecuzione locale
- [Node.js 18+](https://nodejs.org/)
- Yarn
    Per installare Yarn, dopo aver installato node, utilizza in ordine i comandi 
    ```bash
        # Installa Yarn globalmente
        npm install -g yarn
        # Controlla se yarn è installato
        yarn --version
    ```
- Chromium/Chrome installato

### Per Docker
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/install), NB: se hai già installato docker-desktop questo è integrato

## Installazione e Setup

### 1. Clona il repository

```bash
git clone <repository-url>
cd whatsapp-bot-auguri
```

### 2. Configura le variabili d'ambiente

Crea un file `.env` nella root del progetto:

```env
# Ollama Configuration
OLLAMA_ENABLED=true
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2

```

## Esecuzione Locale (Sviluppo)

### Installazione dipendenze

```bash
yarn install
```

### Avvio Ollama locale

Prima di avviare il bot, assicurati che Ollama sia in esecuzione:

```bash
# Installa Ollama (se non l'hai già fatto)
curl -fsSL https://ollama.com/install.sh | sh

# Scarica il modello
ollama pull llama3.2

# Avvia Ollama (se non è già in esecuzione come servizio)
ollama serve
```

### Modalità sviluppo (con hot-reload)

```bash
# Esegue direttamente il TypeScript con ts-node
yarn dev
```

### Modalità produzione

```bash
# Compila il TypeScript
yarn build

# Esegue il JavaScript compilato
yarn start
```

### Prima configurazione

1. Avvia il bot con `yarn dev` o `yarn start`
2. Vedrai un **QR code** nel terminale
3. Apri WhatsApp sul telefono
4. Vai su **Impostazioni** → **Dispositivi collegati** → **Collega un dispositivo**
5. Scansiona il QR code
6. Il bot si autenticherà e sarà pronto!

> **Nota**: I dati di autenticazione vengono salvati nella cartella `wwebjs_auth/` e saranno riutilizzati ai prossimi avvii.

## Esecuzione con Docker

### Build e avvio completo

```bash
# Build delle immagini
docker-compose build

# Avvia i container
docker-compose up
```

Oppure tutto in un comando:

```bash
docker-compose up --build
```

### Avvio in background

```bash
docker-compose up -d
```

### Scarica il modello Ollama (primo avvio)

```bash
# Dopo che i container sono avviati
docker exec -it ollama ollama pull llama3.2

# Oppure un modello più leggero e veloce
docker exec -it ollama ollama pull llama3.2:1b
```

### Visualizza i log

```bash
# Tutti i log
docker-compose logs -f

# Solo bot WhatsApp
docker-compose logs -f whatsapp-bot

# Solo Ollama
docker-compose logs -f ollama
```

### Scansiona il QR code

Il QR code apparirà nei log del bot:

```bash
docker-compose logs -f whatsapp-bot
```

Scansionalo con WhatsApp come descritto sopra.

### Ferma i container

```bash
# Ferma senza rimuovere
docker-compose stop

# Ferma e rimuovi container
docker-compose down

# Ferma, rimuovi container E volumi (perdi i dati)
docker-compose down -v
```

## 🔧 Configurazione Avanzata

### Personalizza le parole chiave per gli auguri

Modifica l'array `keywordsAuguri` in `src/bot.ts`:

### Personalizza la risposta di Ollama

Modifica il prompt di sistema nella funzione `getOllamaResponse`:

### Cambia modello Ollama

Nel `.env`:

```env
# Modelli consigliati:
OLLAMA_MODEL=llama3.2        # Bilanciato (2GB)
# OLLAMA_MODEL=llama3.2:1b   # Veloce e leggero (1GB)
# OLLAMA_MODEL=phi3          # Ottimo per italiano (2GB)
# OLLAMA_MODEL=mistral       # Più potente (4GB)
```

Avvia il bot, ricevi messaggi e copia gli ID dalle console per aggiungerli alla blacklist.

## 📂 Struttura del Progetto

```
whatsapp-bot-auguri/
├── src/
│   └── bot.ts              # Codice principale del bot
├── dist/                   # JavaScript compilato (generato)
├── node_modules/           # Dipendenze Node.js (generato)
├── wwebjs_auth/            # Dati autenticazione WhatsApp (generato)
├── .env                    # Configurazione (da creare)
├── .dockerignore           # File ignorati da Docker
├── .gitignore              # File ignorati da Git
├── docker-compose.yml      # Configurazione Docker Compose
├── Dockerfile              # Istruzioni build Docker
├── package.json            # Dipendenze e script npm
├── tsconfig.json           # Configurazione TypeScript
├── yarn.lock               # Lock file dipendenze
└── README.md               # Questo file
```

## Comandi Utili

### Sviluppo locale

```bash
yarn dev            # Avvia in modalità sviluppo
yarn build          # Compila TypeScript
yarn start          # Esegue versione compilata
yarn clean          # Rimuove cartella dist/
```

### Docker

```bash
# Build e gestione
docker-compose build --no-cache       # Build pulito
docker-compose up                     # Avvia con log
docker-compose up -d                  # Avvia in background
docker-compose down                   # Ferma tutto
docker-compose restart whatsapp-bot   # Riavvia solo il bot

# Log e debug
docker-compose logs -f                # Tutti i log
docker-compose logs --tail=100        # Ultimi 100 log
docker exec -it whatsapp-auguri-bot /bin/bash  # Entra nel container

# Ollama
docker exec -it ollama ollama list              # Lista modelli
docker exec -it ollama ollama pull <model>      # Scarica modello
docker exec -it ollama ollama run llama3.2      # Test interattivo
```

## Troubleshooting

### Il QR code non appare

```bash
# Rimuovi dati di autenticazione vecchi
rm -rf wwebjs_auth

# Riavvia
docker-compose down
docker-compose up --build
```

### Ollama non risponde

```bash
# Verifica che Ollama sia attivo
docker-compose ps

# Verifica connettività
docker exec -it whatsapp-auguri-bot curl http://ollama:11434/api/tags

# Verifica modelli disponibili
docker exec -it ollama ollama list
```

### Errore "Could not find Chrome"

In locale, installa Puppeteer completo:

```bash
yarn add puppeteer
```

### Il bot non risponde ai messaggi

1. Verifica che sia connesso: cerca "✅ Bot pronto" nei log
2. Controlla la blacklist: il contatto potrebbe essere escluso
3. Per messaggi generici, verifica che `OLLAMA_ENABLED=true`

## Note Importanti

- **Account WhatsApp**: Usa un numero secondario per sicurezza. WhatsApp potrebbe bannare account che usano bot non ufficiali.
- **Rate limiting**: Il bot risponde a TUTTI i messaggi che non sono in blacklist. Considera di implementare rate limiting per evitare spam.
- **Backup**: La cartella `wwebjs_auth/` contiene i dati di autenticazione. Fai backup regolari.
- **Privacy**: I messaggi vengono processati localmente da Ollama, nessun dato viene inviato a server esterni.

## Licenza

MIT License - Sentiti libero di modificare e distribuire.

## Contributi

Pull request e issue sono benvenute!

## Supporto

Per domande o problemi, apri una issue su GitHub.

---

**Buon divertimento con il tuo bot WhatsApp!**
