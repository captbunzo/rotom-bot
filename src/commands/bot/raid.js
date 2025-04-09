
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';

const raid = {
	data: new SlashCommandBuilder()
		.setName('raid')
		.setDescription('Do raid stuff'),
	
	async execute(interaction) {
		await interaction.reply({
			content: 'Raid stuff not yet implemented'
		});
	}
};

export default raid;
