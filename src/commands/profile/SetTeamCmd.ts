import {
	ChatInputCommandInteraction,
	SlashCommandBuilder
} from 'discord.js';

import TrainerTeamButtons from '#src/components/buttons/TrainerTeamButtons.js';

const SetTeamCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('set-team')
        .setDescription('Set your team'),

	async execute(interaction: ChatInputCommandInteraction) {
		await TrainerTeamButtons.show(interaction);
	}
};

export default SetTeamCmd;