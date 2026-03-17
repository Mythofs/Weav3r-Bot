const { SlashCommandBuilder } = require("discord.js");
const min = require('../../priceMin.js');

module.exports = {
    data: new SlashCommandBuilder().setName('listmin').setDescription('List minimum mug amount'),
    async execute(interaction) {
        try {
            await interaction.reply(min);
        }
        catch(error) { await interaction.reply(`Error occurred when listing bs ${error.message}`); }
    }
}