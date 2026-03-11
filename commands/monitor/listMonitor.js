const { SlashCommandBuilder } = require("discord.js");
const monitor = require('../../monitorStore.js');

module.exports = {
    data: new SlashCommandBuilder().setName('listmonitor').setDescription('Lists all monitoring'),
    async execute(interaction) {
        try {
            if(monitor.size == 0)
                return await interaction.reply('Not monitoring any items');
            let s = '';
            for(const id of monitor.keys())
                s += id + ', ';
            await interaction.reply(`Monitoring items: ${s.substring(0,s.length-2)}`);
        }
        catch(error) { await interaction.reply(`Error occurred when listing items ${error.message}`); }
    }
}