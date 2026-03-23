const { Client, Collection, Events, GatewayIntentBits, MessageFlags } = require('discord.js');
const { token, apiKey } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const itemId = require('./itemId.js');
const priceMin = require('./priceMin.js');
const bstotal = require('./bstotal.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for(const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
    for(const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if('data' in command && 'execute' in command)
            client.commands.set(command.data.name, command);
        else
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for(const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if(event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}
setUp().then(() => client.login(token));

async function setUp()
{
    let response = await fetch(`https://api.torn.com/torn/?selections=items&key=${apiKey}`);
    const data = await response.json();
    response = await fetch(`https://api.torn.com/v2/user/battlestats?comment=Weav3r%20Mug%20Bot&key=${apiKey}`);
    const bs = await response.json();
    bstotal.value = bs.battlestats.strength.value * (1 + bs.battlestats.strength.modifier * 0.01) + bs.battlestats.defense.value * (1 + bs.battlestats.defense.modifier * 0.01) + bs.battlestats.speed.value * (1 + bs.battlestats.speed.modifier * 0.01) + bs.battlestats.dexterity.value * (1 + bs.battlestats.dexterity.modifier * 0.01);
    for(const [id, item] of Object.entries(data.items))
        itemId.set(id, item.name);
    priceMin.value = 1500000;
}