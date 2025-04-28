
import { MessageFlags, SlashCommandBuilder } from 'discord.js';

const server = {
	global: false,
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('Provides information about the server.'),
    
	async execute(interaction) {
        client.logger.log(interaction);
		await interaction.reply({
			content: `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`,
		 	flags: MessageFlags.Ephemeral
		});
	},
};

export default server;