const { SlashCommandBuilder,EmbedBuilder } = require('discord.js');
const apiInfo = require("../../apiInfo.js");
const itemId = require("../../idCache.js");

module.exports = { 
    data: new SlashCommandBuilder().setName('apiInfo').setDescription('Sends info about API calls'), 
    async execute(interaction) {
        let total = 0;
        let calls = [];
        for(const [key, value] of apiInfo) {
            total += Number(value);
            calls.push({name : itemId.get(key), value: value, inline: true});
        }
        const embed = new EmbedBuilder()
            .setTitle("API CALLS")
            .setColor(0xF59E0B)
            .addFields(calls);
        interaction.reply({ embeds: [embed] });
    },
};