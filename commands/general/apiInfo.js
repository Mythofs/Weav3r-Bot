const { SlashCommandBuilder,EmbedBuilder } = require('discord.js');
const apiInfo = require("../../apiInfo.js");
const itemId = require("../../idCache.js");

module.exports = { 
    data: new SlashCommandBuilder().setName('apiinfo').setDescription('Sends info about API calls'), 
    async execute(interaction) {
        try {
            if(apiInfo.size == 0)
                interaction.reply("No API calls yet");
            else {
                console.log(apiInfo);
                let total = 0;
                let calls = [];
                console.log(itemId.get(String(apiInfo.get("206"))));
                for(const [key, value] of apiInfo) {
                    total += Number(value);
                    calls.push({name : itemId.get(String(key)), value: value, inline: true});
                }
                const embed = new EmbedBuilder()
                    .setTitle("API CALLS")
                    .setColor(0xF59E0B)
                    .addFields(calls);
                interaction.reply({ embeds: [embed] });
            }
        }
        catch(error) {
            interaction.reply({content : error.message});
        }
    },
};