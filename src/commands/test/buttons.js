
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder } from 'discord.js';

const buttons = {
	data: new SlashCommandBuilder()
		.setName('buttons')
		.setDescription('Tests buttons'),
	
	async execute(interaction) {
		const danger = new ButtonBuilder()
			.setCustomId('danger')
			.setLabel('Danger')
			.setStyle(ButtonStyle.Danger);
		
		const link = new ButtonBuilder()
			.setLabel('Link')
			.setURL('https://www.google.com')
			.setStyle(ButtonStyle.Link);
				
		const primary = new ButtonBuilder()
			.setCustomId('primary')
			.setLabel('Primary')
			.setStyle(ButtonStyle.Primary);
		
		const secondary = new ButtonBuilder()
			.setCustomId('secondary')
			.setLabel('Secondary')
			.setStyle(ButtonStyle.Secondary);
		
		const success = new ButtonBuilder()
			.setCustomId('success')
			.setLabel('Success')
			.setStyle(ButtonStyle.Success)
			.setDisabled(true);
		
		const row = new ActionRowBuilder()
			.addComponents(danger, link, primary, secondary, success);
		
		await interaction.reply({
			content: 'This is a button test (except for premium which is harder to test)',
			components: [row]
		});
	}
};

export default buttons;
