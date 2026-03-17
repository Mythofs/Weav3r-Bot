const { SlashCommandBuilder } = require('discord.js');
const priceMin = require('../../priceMin.js');

module.exports = { 
    data: new SlashCommandBuilder().setName('updatemin').setDescription('Updates minimum mug amount')
    .addStringOption((option) => option.setName('price').setDescription('The minimum amount').setRequired(true)), 
    async execute(interaction){
        priceMin.value = Number(interaction.options.getString('price', true));
        await interaction.reply(`Set minimum mug amount to ${priceMin}`);
    },
};