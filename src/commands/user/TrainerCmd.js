
import {
	MessageFlags,
	SlashCommandBuilder
} from 'discord.js';

import {
	MaxAutoCompleteChoices,
	Team
} from '../../Constants.js';

import Trainer from '../../data/Trainer.js';

const ClearTeam = 'Clear Team';

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
			.addStringOption(option => option
				.setName('team')
				.setDescription('Traner Team')
				.setRequired(true)
				.setChoices(
					{ name: Team.Instinct, value: Team.Instinct },
					{ name: Team.Mystic, value: Team.Mystic },
					{ name: Team.Valor, value: Team.Valor },
					{ name: ClearTeam, value: ClearTeam }
				)
			)
		)
		.addSubcommand(subCommand => subCommand
			.setName('delete')
			.setDescription('Delete your trainer profile')
		)
		.addSubcommand(subCommand => subCommand
			.setName('code')
			.setDescription('Get trainer code')
			.addUserOption(option => option
				.setName('user')
				.setDescription('Trainer discord user')
				.setRequired(false)
			)
			.addStringOption(option => option
				.setName('name')
				.setDescription('Trainer name')
				.setAutocomplete(true)
				.setRequired(false)
			)
		)
		.addSubcommand(subCommand => subCommand
			.setName('show')
			.setDescription('Show a trainer profile')
			.addUserOption(option => option
				.setName('user')
				.setDescription('Trainer discord user')
				.setRequired(false)
			)
			.addStringOption(option => option
				.setName('name')
				.setDescription('Trainer name')
				.setAutocomplete(true)
				.setRequired(false)
			)
		),
	
	async execute(interaction) {
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

    async autocomplete(interaction) {
        const client = interaction.client;
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'code' : this.autocompleteShowOrCode(interaction); break;
            case 'show' : this.autocompleteShowOrCode(interaction); break;
            default :
                client.logger.error(`Trainer profile command autocomplete not yet implemented for subcommand -- ${subCommand}`);
        }
    },

	async handlModalSubmit(interaction) {
		await interaction.reply({ content: `Trainer profile management not yet implemented for modal submit -- ${subCommand}`, flags: MessageFlags.Ephemeral })
	},

	async executeProfile(interaction) {
		const modal = interaction.client.modals.get('trainerProfile');
		await modal.show(interaction);
	},
	
  //async executeTeam(interaction) {
  //	const button = interaction.client.buttons.get('TrainerTeam');
  //	await button.show(interaction);
  //},

	async executeTeam(interaction) {
		const client = interaction.client;
        const team = interaction.options.getString('team');
		const trainer = await Trainer.get({ id: interaction.user.id, unique: true });

		if (!trainer) {
			interaction.reply(Trainer.getSetupTrainerFirstMessage());
			return;
		}
		
		trainer.team = ( team == ClearTeam ? null : team );
		await trainer.update();

		const message = ( team == ClearTeam
			? `Trainer team cleared`
			: `Trainer team set to ${team}`
		);
		await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
	},

	async executeDelete(interaction) {
		await interaction.reply({ content: `Delete -- Trainer profile management not yet implemented`, flags: MessageFlags.Ephemeral });
	},

	async executeShowOrCode(interaction, subCommand) {
		const client = interaction.client;
		let name = interaction.options.getString('name');
		let user = interaction.options.getUser('user');

		if (!user && !name) {
			user = interaction.user;
		}

		let trainer;
		let reference;

		if (user) {
			trainer = await Trainer.get({ id: user.id, unique: true });
			reference = user;
		} else if (name) {
			trainer = await Trainer.get({ name: name, unique: true });
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
				content: trainer.formattedCode,
				flags: MessageFlags.Ephemeral
			});
		}
	},

	async autocompleteShowOrCode(interaction, subCommand) {
		const client = interaction.client;
		const focusedOption = interaction.options.getFocused(true);
		client.logger.debug(`Initiating autocomplete for ${subCommand} -- ${this.data.name} :: ${focusedOption.name} :: ${focusedOption.value}`);

		let choices = [];
		if (focusedOption.name == 'name') {
			choices = await Trainer.getNameChoices(focusedOption.value);
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
