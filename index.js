require('dotenv').config()
const { Client } = require('whatsapp-web.js');
const QRCode = require('qrcode')
const opn = require('opn');

const client = new Client();


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
    if (msg.body.toLocaleLowerCase().includes('auguri') || (msg.body.toLocaleLowerCase().includes('buon natale') || msg.body.toLocaleLowerCase().includes('buon capodanno') || msg.body.toLocaleLowerCase().includes('buon anno'))) {
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
});

client.initialize();