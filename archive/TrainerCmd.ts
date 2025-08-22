import {
	AutocompleteInteraction,
	ChatInputCommandInteraction,
	MessageFlags,
	SlashCommandBuilder
} from 'discord.js';

import Client from '#src/Client.js';
import { MaxAutoCompleteChoices } from '#src/Constants.js';
import Trainer from '#src/models/Trainer.js';

import TrainerProfileModal from '#src/components/modals/TrainerProfileModal.js';
import TrainerTeamButtons from '#src/components/buttons/TrainerTeamButtons.js';

const TrainerCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('trainer')
		.setDescription('Manage your trainer profile')
		.addSubcommand(subCommand => subCommand
			.setName('profile')
			.setDescription('Setup your trainer profile')
		)
		.addSubcommand(subCommand => subCommand
			.setName('team')
			.setDescription('Set your team')
		)
		.addSubcommand(subCommand => subCommand
			.setName('delete')
			.setDescription('Delete your trainer profile')
		)
		.addSubcommand(subCommand => subCommand
			.setName('code')
			.setDescription('Get trainer code')
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
		)
		.addSubcommand(subCommand => subCommand
			.setName('show')
			.setDescription('Show a trainer profile')
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
		),

	async execute(interaction: ChatInputCommandInteraction) {
		const subCommand = interaction.options.getSubcommand();

		switch (subCommand) {
			case 'profile' : this.executeProfile(interaction); break;
			case 'team'    : this.executeTeam(interaction); break;
			case 'delete'  : this.executeDelete(interaction); break;
			case 'code'    : this.executeShowOrCode(interaction, subCommand); break;
			case 'show'    : this.executeShowOrCode(interaction, subCommand); break;
			default :
				await interaction.reply({ content: `Trainer profile management not yet implemented -- ${subCommand}`, flags: MessageFlags.Ephemeral }); 
		}
	},

    async autocomplete(interaction: AutocompleteInteraction) {
        const client = interaction.client as Client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'code' : this.autocompleteShowOrCode(interaction, subCommand); break;
            case 'show' : this.autocompleteShowOrCode(interaction, subCommand); break;
            default :
                client.logger.error(`Trainer profile command autocomplete not yet implemented for subcommand -- ${subCommand}`);
        }
    },

	async executeProfile(interaction: ChatInputCommandInteraction) {
		await TrainerProfileModal.show(interaction);
	},
	
	async executeTeam(interaction: ChatInputCommandInteraction) {
		await TrainerTeamButtons.show(interaction);
	},

	async executeDelete(interaction: ChatInputCommandInteraction) {
		await interaction.reply({ content: `Delete -- Trainer profile management not yet implemented`, flags: MessageFlags.Ephemeral });
	},

	async executeShowOrCode(interaction: ChatInputCommandInteraction, subCommand: string) {
		let name = interaction.options.getString('trainer-name');
		let user = interaction.options.getUser('discord-username');

		if (!user && !name) {
			user = interaction.user;
		}

		let trainer;
		let reference;

		if (user) {
			trainer = await Trainer.getUnique({discordId: user.id});
			reference = user;
		} else if (name) {
			trainer = await Trainer.getUnique({ firstName: name });
			reference = name;
		}

		if (!trainer) {
			await interaction.reply({
				content: `Trainer ${reference} not found or has not yet setup a profile`,
				flags: MessageFlags.Ephemeral });
			return;
		}

		if (subCommand == 'show') {
			const embed = await trainer.buildEmbed();
			await interaction.reply({
				embeds: [embed],
				flags: MessageFlags.Ephemeral
			});
		} else if (subCommand == 'code') {
			await interaction.reply({
				content: `Trainer code for ${reference}`,
				flags: MessageFlags.Ephemeral
			});

			await interaction.followUp({
				content: `${trainer.formattedCode}`,
				flags: MessageFlags.Ephemeral
			});
		}
	},

	async autocompleteShowOrCode(interaction: AutocompleteInteraction, subCommand: string) {
		const client = interaction.client as Client;
		const focusedOption = interaction.options.getFocused(true);
		client.logger.debug(`Initiating autocomplete for ${subCommand} -- ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);

		let choices: string[] = [];
		if (focusedOption.name == 'trainer-name') {
			choices = await Trainer.getTrainerNameChoices(focusedOption.value);
		}

		if (choices.length <= MaxAutoCompleteChoices) {
			await interaction.respond(
				choices.map(choice => ({ name: choice, value: choice })),
			);
			return;
		}

        await interaction.respond([]);
	}
};

export default TrainerCmd;
