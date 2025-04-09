
import { SlashCommandBuilder } from 'discord.js';

const server = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
    
	async execute(interaction) {
        console.log(interaction);
		await interaction.reply(`This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`);
	},
};

export default server;