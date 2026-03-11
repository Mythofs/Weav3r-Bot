const { SlashCommandBuilder } = require('discord.js');
const apiKey = require('../../config.js');
const bsTotal = require('../../bstotal.js');

module.exports = { 
    data: new SlashCommandBuilder().setName('setBS').setDescription('Updates your battlestats'), 
    async execute(interaction) {
        let response;
        try {
            response = await fetch(`https://api.torn.com/v2/user/battlestats?comment=Weav3r%20Mug%20Bot&key=${apiKey}`);
        }
        catch(error) {
            interaction.reply('Error while fetching https://api.torn.com/v2/user/battlestats');
            throw error;
        }
        let data;
        try {
            data = await response.json();
        }
        catch(error) {
            interaction.reply('Invalid JSON from https://api.torn.com/v2/user/battlestats');
            throw error;
        }
        if(!response.ok) {
            channel.send(`Error from ${url}: ${JSON.stringify(data)}`);
            throw new Error("Error from https://api.torn.com/v2/user/battlestats");
        }
        bsTotal = data.battlestats.total * (4 + data.battlestats.strength.modifier * 0.01 + data.battlestats.defense.modifier * 0.01 + data.battlestats.speed.modifier * 0.01 + data.battlestats.dexterity.modifier * 0.01)/4;
    },
};