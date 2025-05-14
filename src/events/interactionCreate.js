
import {
	Events,
	MessageFlags
} from 'discord.js';

const interactionCreate = {
	name: Events.InteractionCreate,

	/**
	 * @param {import('discord.js').Interaction} interaction
	 */
	async execute(interaction) {
		const client = interaction.client;

		if (interaction.isChatInputCommand() ) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				client.logger.error(`No command matching ${interaction.commandName} was found`);
				return;
			}
			
			if (!command.execute) {
				client.logger.error(`Command ${interaction.commandName} does not have an execute function`);
				return;
			}
			
			try {
				await command.execute(interaction);
			} catch (error) {
				client.logger.error(`Error executing command ${interaction.commandName}`);
				client.logger.dump(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
				} else {
					await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
				}
			}
			
		} else if (interaction.isAutocomplete()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				client.logger.error(`No command matching ${interaction.commandName} was found`);
				return;
			}

			if (!command.autocomplete) {
				client.logger.error(`Command ${interaction.commandName} does not have an autocomplete function`);
				return;
			}

			try {
				await command.autocomplete(interaction);
			} catch (error) {
				client.logger.error(`Error autocompleting command ${interaction.commandName}`);
				client.logger.dump(error);
			}

		} else if (interaction.isModalSubmit()) {
			const modal = interaction.client.modals.get(interaction.customId);
			if (!modal) {
				client.logger.error(`No modal matching ${interaction.customId} was found`);
				return;
			}

			try {
				await modal.handle(interaction);
			} catch (error) {
				client.logger.error(`Error submitting model ${interaction.customId}`);
				client.logger.dump(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while handling this modal!', flags: MessageFlags.Ephemeral });
				} else {
					await interaction.reply({ content: 'There was an error while handling this modal!', flags: MessageFlags.Ephemeral });
				}
			}

		} else if (interaction.isButton()) {
			const buttonName = interaction.customId.split('.')[0];
			const button = interaction.client.buttons.get(buttonName);
			if (!button) {
				client.logger.error(`No button matching ${buttonName} was found`);
				return;
			}

			try {
				await button.handle(interaction);
			} catch (error) {
				client.logger.error(`Error handling button ${buttonName}`);
				client.logger.dump(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: 'There was an error while handling this button!', flags: MessageFlags.Ephemeral });
				} else {
					await interaction.reply({ content: 'There was an error while handling this button!', flags: MessageFlags.Ephemeral });
				}
			}
		}
	},
};

export default interactionCreate;
