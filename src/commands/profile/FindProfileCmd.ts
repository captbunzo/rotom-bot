import {
    ChatInputCommandInteraction,
	SlashCommandBuilder
} from 'discord.js';

const FindProfileCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('find-profile')
		.setDescription('Find a trainer profile')
        .addUserOption(option => option
            .setName('discord-username')
            .setDescription('Trainer discord user')
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName('trainer-name')
            .setDescription('Trainer name')
            .setAutocomplete(true)
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName('first-name')
            .setDescription('First name')
            .setRequired(false)
        ),

	async execute(interaction: ChatInputCommandInteraction) {
        await interaction.reply({
            content: 'This command is not implemented yet.',
            ephemeral: true
        });
	}
};

export default FindProfileCmd;