import {
	ChatInputCommandInteraction,
	SlashCommandBuilder
} from 'discord.js';

import Client from '#src/Client.js';

const DeleteProfileCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('delete-profile')
		.setDescription('Delete your trainer profile'),

	async execute(interaction: ChatInputCommandInteraction) {
		const client = interaction.client as Client;
		const deleteProfileButtons = client.buttons.get('DeleteProfile');
		await deleteProfileButtons.show(interaction);
	}
};

export default DeleteProfileCmd;