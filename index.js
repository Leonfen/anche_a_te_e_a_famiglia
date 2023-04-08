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
            prompt: `Questo è un messaggio d'auguri? ${msg.body}, rispondi dicendo "yes" se lo è o "no" se non lo è`,
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
        if (msg.body.toLocaleLowerCase().includes('auguri') || (msg.body.toLocaleLowerCase().includes('buon natale') || msg.body.toLocaleLowerCase().includes('buon capodanno') || msg.body.toLocaleLowerCase().includes('buon anno') || msg.body.toLocaleLowerCase().includes('buone feste') || msg.body.toLocaleLowerCase().includes('auguroni') || msg.body.toLocaleLowerCase().includes('felici feste') || msg.body.toLocaleLowerCase().includes('felice natale'))) {
            msg.getChat().then((response) => {
                if ((!response.name.toLocaleLowerCase().includes('med')) && (!response.name.toLocaleLowerCase().includes('uab')) && (!response.name.toLocaleLowerCase().includes('informatica'))) {
                    msg.reply('Auguri anche a voi e a famiglia! <3');
                }
            }).catch(err => console.log(err))
        }
        else if (msg.body.toLocaleLowerCase().includes('buon compleanno')) {
            msg.getChat().then((response) => {
                if ((!response.name.toLocaleLowerCase().includes('med')) && (!response.name.toLocaleLowerCase().includes('uab')) && (!response.name.toLocaleLowerCase().includes('informatica'))) {
                    msg.reply('Buon compleanno anche a voi e a famiglia! <3');
                }
            }).catch(err => console.log(err))
        }
    }
})

client.initialize();