import {
	ChatInputCommandInteraction,
	SlashCommandBuilder
} from 'discord.js';

import Client from '#src/Client.js';

const UpdateProfileCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('update-profile')
		.setDescription('Update your trainer profile'),
	
	async execute(interaction: ChatInputCommandInteraction) {
		const client = interaction.client as Client;
		const trainerProfileModal = client.modals.get('TrainerProfile');
		await trainerProfileModal.show(interaction);
	}
};

export default UpdateProfileCmd;