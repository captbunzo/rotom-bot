import {
	ChatInputCommandInteraction,
	SlashCommandBuilder
} from 'discord.js';

import TrainerProfileModal from '#src/components/modals/TrainerProfileModal.js';

const SetupProfileCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('setup-profile')
		.setDescription('Setup your trainer profile'),

	async execute(interaction: ChatInputCommandInteraction) {
		await TrainerProfileModal.show(interaction);
	}
};

export default SetupProfileCmd;