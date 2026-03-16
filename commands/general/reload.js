const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('reload').setDescription('Reloads a command.').addStringOption((option) => option.setName('command').setDescription('The command to reload.').setRequired(true)),
    async execute(interaction) {
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);
        if(!command) {
            return interaction.reply(`There is no command with name \`${commandName}\`!`);
        }
        delete require.cache[require.resolve(`./${command.data.name}.js`)];

        const fs = require('fs');
        const path = require('path');
        const files = fs.readdirSync(__dirname).filter(file => file.endsWith('.js'));

        try {
            for(const file of files) {
                const newCommand = require(path.join(__dirname, file));
                interaction.client.commands.set(newCommand.data.name, newCommand);
                await interaction.reply(`Command \`${newCommand.data.name}\` was reloaded!`);
            }
        }
        catch(error) {
            console.error(error);
            await interaction.reply(`There was an error while reloading a command \` ${command.data.name}\`:\n\`${error.message}\``,);
        }
    }
}