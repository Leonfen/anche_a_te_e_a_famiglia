import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import * as dotenv from 'dotenv';
import { Ollama } from 'ollama';

dotenv.config();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const ollama = new Ollama({
    host: process.env.OLLAMA_HOST || 'http://localhost:11434'
});

const keywordsAuguri: string[] = [
    // --- Generici e Affettuosi ---
    'auguri', 'auguroni', 'augurissimi', 'tanti auguri', 'tantissimi auguri', 
    'buone feste', 'buonissime feste', 'serene feste', 'felici feste', 
    'auguri a te e famiglia', 'auguri a tutti', 'un mondo di auguri',

    // --- Natale (Vigilia e Giorno di Natale) ---
    'buon natale', 'felice natale', 'santo natale', 'sereno natale', 
    'buon natalin', 'merry christmas', 'merry xmas', 'xmas', 
    'buona vigilia', 'vigilia di natale', 'notte di natale', 
    'nascita di gesù', 'buon natalino', 'auguri natalizi',

    // --- Capodanno e Fine Anno ---
    'buon anno', 'felice anno nuovo', 'buon 2026', 'felice 2026', 
    'benvenuto 2026', 'buon capodanno', 'capodanno 2026', 
    'buon fine anno', 'buona fine e buon principio', 'buon principio', 
    'prospero anno nuovo', 'buon san silvestro', 'notte di capodanno', 
    'ultimo dell\'anno', 'buon anno a tutti', 'felice anno venturo',
    'happy new year', 'buon anno solare', 'cenone', 'veglione',

    // --- Varianti Dialettali e Internazionali Comuni ---
    'bon nadal', 'buon natale a tutti', 'joyeux noël', 'feliz navidad',
    'frohe weihnachten', 'happy holidays', 'auguri di cuore',

    // --- Parole Chiave Correlate (per filtri più ampi) ---
    // 'brindisi', 'panettone', 'pandoro', 'bollicine', 'fuochi d\'artificio', 
    // 'babbu natale', 'slitta', 'renne', 'albero di natale', 'presepe'
];

const escludedChat: string[] = [
    // TODO: Insert the banned keywords
]

const ollamaModel = process.env.OLLAMA_MODEL || 'llama3.2';
const ollamaEnabled = process.env.OLLAMA_ENABLED === 'true';

// Funzione per verificare se il modello esiste
async function checkAndPullModel(): Promise<boolean> {
    if (!ollamaEnabled) {
        return false;
    }

    try {
        console.log(`🔍 Verifico disponibilità modello: ${ollamaModel}...`);
        
        // Lista tutti i modelli disponibili
        const models = await ollama.list();
        const modelExists = models.models.some(m => m.name.includes(ollamaModel));
        
        if (modelExists) {
            console.log(`✅ Modello ${ollamaModel} già disponibile!`);
            return true;
        }
        
        // Il modello non esiste, prova a scaricarlo
        console.log(`📥 Modello ${ollamaModel} non trovato. Avvio download...`);
        console.log(`⏳ Questo potrebbe richiedere alcuni minuti...`);
        
        await ollama.pull({
            model: ollamaModel,
            stream: true
        });
        
        console.log(`✅ Modello ${ollamaModel} scaricato con successo!`);
        return true;
        
    } catch (error) {
        console.error(`❌ Errore nella verifica/download del modello:`, error);
        console.error(`💡 Assicurati che Ollama sia in esecuzione su ${process.env.OLLAMA_HOST || 'http://localhost:11434'}`);
        return false;
    }
}

// Funzione per ottenere risposta da Ollama
async function getOllamaResponse(userMessage: string): Promise<string> {
    try {
        const response = await ollama.chat({
            model: ollamaModel,
            messages: [
                {
                    role: 'system',
                    content: 'Sei un assistente amichevole e conciso. Rispondi dicendo solo "true" se il messaggio contiene auguri, "false" altrimenti.'
                },
                {
                    role: 'user',
                    content: userMessage
                }
            ],
            stream: false
        });
        
        return response.message.content;
    } catch (error) {
        console.error('❌ Errore Ollama:', error);
        return 'Mi dispiace, non riesco a rispondere in questo momento. 😅';
    }
}

// Variabile globale per sapere se Ollama è disponibile
let ollamaReady = false;

// Inizializza Ollama prima di avviare WhatsApp
async function initializeBot() {
    console.log('🚀 Avvio bot...');
    
    if (ollamaEnabled) {
        ollamaReady = await checkAndPullModel();
        if (!ollamaReady) {
            console.warn('⚠️  Ollama non disponibile. Il bot risponderà solo agli auguri.');
        }
    } else {
        console.log('ℹ️  Ollama disabilitato. Il bot risponderà solo agli auguri.');
    }
    
    client.initialize();
}

client.on('qr', (qr: string) => {
    console.log('Scansiona questo QR code con WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ Bot WhatsApp pronto e attivo!');
    console.log(`🤖 Ollama: ${ollamaReady ? 'Pronto' : 'Non disponibile'}`);
    if (ollamaReady) {
        console.log(`🤖 Modello: ${ollamaModel}`);
    }
});

client.on('authenticated', () => {
    console.log('✅ Autenticazione WhatsApp riuscita!');
});

client.on('message', async (msg: Message) => {
    try {
        const chat = await msg.getChat();
        const chatName = (chat.name || '').toLowerCase();
        const text: string = msg.body.toLowerCase();
        
        
        // Controlla substrings nel nome
        const contieneSubstringEsclusa = escludedChat.some(nomeChat => 
            chatName.includes(nomeChat)
        );
        
        if (contieneSubstringEsclusa) {
            console.log(`⏭️  Ignorato: "${chat.name}" contiene substring bannata`);
            return;
        }
        
        // Controlla se contiene auguri
        const contieneAuguri = keywordsAuguri.some(keyword => 
            text.includes(keyword)
        );
        
        if (contieneAuguri) {
            console.log(`🎄 Auguri da: ${chat.name || 'Sconosciuto'}`);
            await msg.reply('Auguri anche a te e a famiglia! <3');
            console.log('✅ Risposta auguri inviata!');
        } else if (ollamaReady) {
            console.log(`🤖 Messaggio da: ${chat.name || 'Sconosciuto'}`);
            console.log(`   Testo: "${text}"`);            
            const ollamaResponse = await getOllamaResponse(text);

            if (ollamaResponse.includes('true')){ 
                console.log(`   Risposta: "${ollamaResponse}"`);
                await msg.reply('Auguri anche a te e a famiglia! <3');
                console.log('✅ Risposta Ollama inviata!');
            }
        }
    } catch (error) {
        console.error('❌ Errore nella gestione del messaggio:', error);
    }
});

client.on('disconnected', (reason: string) => {
    console.log('❌ Client disconnesso:', reason);
});

// Avvia tutto
initializeBot();

