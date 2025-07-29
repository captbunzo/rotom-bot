
import {
	SlashCommandBuilder
} from 'discord.js';

const SetupProfileCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('setup-profile')
		.setDescription('Setup your trainer profile'),
	
	async execute(interaction) {
		const trainerProfileModal = interaction.client.modals.get('TrainerProfile');
		await trainerProfileModal.show(interaction);
	}
};

export default SetupProfileCmd;
