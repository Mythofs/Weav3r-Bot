const { SlashCommandBuilder } = require('discord.js');
const { apiKey } = require('../../config.json');
const bsTotal = require('../../bstotal.js');

module.exports = { 
    data: new SlashCommandBuilder().setName('updatebs').setDescription('Updates your battlestats'), 
    async execute(interaction) {
        let response;
        try {
            response = await fetch(`https://api.torn.com/v2/user/battlestats?comment=Weav3r%20Mug%20Bot&key=${apiKey}`);
        }
        catch(error) {
            return interaction.reply('Error while fetching https://api.torn.com/v2/user/battlestats');
        }
        let bs;
        try {
            bs = await response.json();
        }
        catch(error) {
            return interaction.reply('Invalid JSON from https://api.torn.com/v2/user/battlestats');
        }
        if(!response.ok)
            return interaction.reply(`Error from ${url}: ${JSON.stringify(bs)}`);
        bsTotal.value = bs.battlestats.strength.value * (1 + bs.battlestats.strength.modifier * 0.01) + bs.battlestats.defense.value * (1 + bs.battlestats.defense.modifier * 0.01) + bs.battlestats.speed.value * (1 + bs.battlestats.speed.modifier * 0.01) + bs.battlestats.dexterity.value * (1 + bs.battlestats.dexterity.modifier * 0.01);
        interaction.reply(`Updated battlestats: ${bsTotal.value}`);
    },
};