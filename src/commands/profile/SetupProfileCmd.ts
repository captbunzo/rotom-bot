import {
	ChatInputCommandInteraction,
	SlashCommandBuilder
} from 'discord.js';

import Client from '#src/Client.js';

const SetupProfileCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('setup-profile')
		.setDescription('Setup your trainer profile'),

	async execute(interaction: ChatInputCommandInteraction) {
		const client = interaction.client as Client;
		const trainerProfileModal = client.modals.get('TrainerProfile');
		await trainerProfileModal.show(interaction);
	}
};

export default SetupProfileCmd;