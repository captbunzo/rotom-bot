
import {
	MessageFlags,
	SlashCommandBuilder
} from 'discord.js';

import {
	Team
} from '../../Constants.js';

import Trainer from '../../data/Trainer.js';

const ClearTeam = 'Clear Team';

const TrainerCmd = {
	global: true,
	data: new SlashCommandBuilder()
		.setName('trainer')
		.setDescription('Manage your trainer profile')
		.addSubcommand(subCommand =>
			subCommand
				.setName('profile')
				.setDescription('Setup your trainer profile')
			)
		.addSubcommand(subCommand =>
			subCommand
				.setName('team')
				.setDescription('Set your team')
				.addStringOption(option =>
					option
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
		.addSubcommand(subCommand =>
			subCommand
				.setName('delete')
				.setDescription('Delete your trainer profile')
			)
		.addSubcommand(subCommand =>
			subCommand
				.setName('code')
				.setDescription('Get trainer code for a discord user')
				.addUserOption(option =>
					option
						.setName('trainer')
						.setDescription('Trainer discord user')
						.setRequired(true)
					)
			),
	
	async execute(interaction) {
		const subCommand = interaction.options.getSubcommand();

		switch (subCommand) {
			case 'profile' : this.executeProfile(interaction);  break;
			case 'team'    : this.executeTeam(interaction);     break;
			case 'delete'  : this.executeDelete(interaction);   break;
			case 'code'    : this.executeCode(interaction);     break;
			default :
				await interaction.reply({ content: `Trainer profile management not yet implemented -- ${subCommand}`, flags: MessageFlags.Ephemeral }); 
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

	async executeCode(interaction) {
		await interaction.reply({ content: `Code -- Trainer profile management not yet implemented`, flags: MessageFlags.Ephemeral });
	}
};

export default TrainerCmd;
