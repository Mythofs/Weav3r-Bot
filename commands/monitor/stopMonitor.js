const { SlashCommandBuilder } = require("discord.js");
const monitor = require('../../monitorStore.js');

module.exports = {
    data: new SlashCommandBuilder().setName('stop_monitor').setDescription('Stop monitoring an item.')
        .addStringOption((option) => option.setName('itemid').setDescription('The item to stop monitoring').setRequired(true)),
    async execute(interaction) {
        const itemId = interaction.options.getString('itemid', true);
        if(monitor.has(itemId)) {
            try { 
                clearInterval(monitor.get(itemId));
                monitor.delete(itemId);
                return await interaction.reply(`Successfully removed item ${itemId}`);
            }
            catch(error) {
                return await interaction.reply(`Error occured when removing item ${itemId} ${error.message}`);
            }
        }
        else {
            return await interaction.reply(`Not monitoring item ${itemId}`);
        }
    }
};