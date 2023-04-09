require('dotenv').config()
// whatsapp modules
const { Client } = require('whatsapp-web.js');
const QRCode = require('qrcode')
const opn = require('opn');
const client = new Client();

// Openai thing
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY,
});
const openai = new OpenAIApi(configuration);



client.on('qr', (qr) => {
    // Generate and scan this code with your phone
    QRCode.toDataURL(qr, function (err, url) {
        console.log('Scannerizza il tuo codice qr')
        opn(url, { app: process.env.BROWSER });
    });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    try {
        openai.createCompletion({
            model: "text-davinci-003",
            prompt: `Questo è un messaggio d'auguri di pasqua? ${msg.body}, rispondi dicendo "yes" se lo è o "no" se non lo è`,
            temperature: 0,
            max_tokens: 4000,
        }).then(response => {
            console.log(response.data.choices)
            if (response.data.choices[0].text?.toLocaleLowerCase().includes('yes') || (msg.body.toLocaleLowerCase().includes('auguroni'))) {
                msg.getChat().then((response) => {
                    if ((!response.name.toLocaleLowerCase().includes('med')) && (!response.name.toLocaleLowerCase().includes('uab')) && (!response.name.toLocaleLowerCase().includes('informatica'))) {
                        msg.reply('Auguri anche a voi e a famiglia! <3');
                    }
                })
            }
        })
    } catch {
        // error
    }
})

client.initialize();
