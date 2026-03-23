const { SlashCommandBuilder } = require("discord.js");
const bs = require('../../bstotal.js');

module.exports = {
    data: new SlashCommandBuilder().setName('listbs').setDescription('List battle stat total'),
    async execute(interaction) {
        try {
            await interaction.reply(String(bs.value));
        }
        catch(error) { await interaction.reply(`Error occurred when listing bs ${error.message}`); }
    }
}