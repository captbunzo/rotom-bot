import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
	SlashCommandBuilder
} from 'discord.js';

import FindTrainerCmd from '#src/commands/profile/FindTrainerCmd.js';

const GetTrainerCodeOption = {
    DiscordUsername: 'discord-username',
    TrainerName: 'trainer-name',
    FirstName: 'first-name'
}

const GetTrainerCodeCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('get-trainer-code')
		.setDescription('Get a trainer code')
        .addUserOption(option => option
            .setName(GetTrainerCodeOption.DiscordUsername)
            .setDescription('Trainer discord user')
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName(GetTrainerCodeOption.TrainerName)
            .setDescription('Trainer name')
            .setAutocomplete(true)
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName(GetTrainerCodeOption.FirstName)
            .setDescription('First name')
            .setAutocomplete(true)
            .setRequired(false)
        ),

	execute: async (interaction: ChatInputCommandInteraction) => FindTrainerCmd.execute(interaction),
    autocomplete: async (interaction: AutocompleteInteraction) => FindTrainerCmd.autocomplete(interaction)
};

export default GetTrainerCodeCmd;