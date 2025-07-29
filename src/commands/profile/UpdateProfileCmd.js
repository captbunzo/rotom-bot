
import {
	SlashCommandBuilder
} from 'discord.js';

const UpdateProfileCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('update-profile')
		.setDescription('Update your trainer profile'),
	
	async execute(interaction) {
		const trainerProfileModal = interaction.client.modals.get('TrainerProfile');
		await trainerProfileModal.show(interaction);
	}
};

export default UpdateProfileCmd;
