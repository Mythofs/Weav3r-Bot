const { SlashCommandBuilder } = require("discord.js");
const monitor = require('../../monitorStore.js');
const idCache = require('../../idCache.js');
const apiInfo = require('../../apiInfo.js')

module.exports = {
    data: new SlashCommandBuilder().setName('clearmonitor').setDescription('Stops all monitoring'),
    async execute(interaction) {
        try {
            for(const interval of monitor.values())
                clearInterval(interval);
            monitor.clear();
            idCache.clear();
            apiInfo.clear();
            await interaction.reply('Stopped all monitoring');
        }
        catch(error) { await interaction.reply(`Error occurred when clearing items ${error.message}`); }
    }
}