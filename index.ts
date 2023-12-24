import "dotenv/config";
import { Client } from "whatsapp-web.js";
import { Configuration, OpenAIApi } from "openai";
import qrcode from "qrcode-terminal";

// OpenAI Client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

// WhatsApp Client
const client = new Client({});
client.on("qr", (code) => qrcode.generate(code));

client.on("ready", () => {
  console.log("Client is ready!");
});

client.on("message", async (message) => {
  await message.getChat()
    .then(async (chat) => {
      if((!chat.name.toLowerCase().includes('med')) || (!chat.name.toLowerCase().includes('alfarma')) || (!chat.name.toLowerCase().includes('lettieri'))) {
        if((message.body.toLowerCase().includes('auguri')) || (message.body.toLowerCase().includes('felice natale')) || (message.body.toLowerCase().includes('buon compleanno')) || (message.body.toLowerCase().includes('buone feste')) || (message.body.toLowerCase().includes('buon natale'))){
          message.reply("Auguri anche a te e a famiglia <3!")
        } else {
          /*
          await openai
            .createCompletion({
      model: "text-davinci-003",
      prompt: `From now on you can only answer using "Yes" and "No".
      Is the Italian message "${message.body}" wishing me well for the holidays?`,
    })
    .then((response) => {
      if (response.data.choices[0].text?.toLowerCase().includes("yes")) {
                message.reply("Anche a te e famiglia <3!");
              }
            })
            .catch((e) => console.log(e));
          }
        }
      })
      Too many requests!
    */ 
        console.log("couldn't retrieve it") 
      }
    }
  })
});

client.initialize();
