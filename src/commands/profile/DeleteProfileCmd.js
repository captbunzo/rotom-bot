
import {
	SlashCommandBuilder
} from 'discord.js';

const DeleteProfileCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('delete-profile')
		.setDescription('Delete your trainer profile'),

	async execute(interaction) {
		const deleteProfileButtons = interaction.client.buttons.get('DeleteProfile');
		await deleteProfileButtons.show(interaction);
	}
};

export default DeleteProfileCmd;
