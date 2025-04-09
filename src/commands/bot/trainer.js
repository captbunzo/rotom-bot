
import { SlashCommandBuilder } from 'discord.js';
import { MessageFlags } from 'discord.js';

const trainer = {
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
		//await interaction.reply({ content: `Setup -- Trainer profile management not yet implemented`, flags: MessageFlags.Ephemeral });
	},
	
	async executeTeam(interaction) {
		const button = interaction.client.buttons.get('trainerTeam');
		await button.show(interaction);
		//await interaction.reply({ content: `Team -- Trainer profile management not yet implemented`, flags: MessageFlags.Ephemeral });
	},

	async executeDelete(interaction) {
		await interaction.reply({ content: `Delete -- Trainer profile management not yet implemented`, flags: MessageFlags.Ephemeral });
	},

	async executeCode(interaction) {
		await interaction.reply({ content: `Code -- Trainer profile management not yet implemented`, flags: MessageFlags.Ephemeral });
	}
};

export default trainer;
