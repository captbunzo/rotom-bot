import type {
	 Interaction
} from 'discord.js';

import {
	AutocompleteInteraction,
	ButtonInteraction,
	ChatInputCommandInteraction,
	Events,
	MessageFlags,
	ModalSubmitInteraction,
	StringSelectMenuInteraction
} from 'discord.js';

import Client from '#src/Client.js';
import ComponentIndex from '#src/types/ComponentIndex.js';

const InteractionCreateEvent = {
	name: Events.InteractionCreate,

	async execute(interaction: Interaction) {
		if (interaction.isChatInputCommand() ) {
			return await this.executeChatInputCommandInteraction(interaction);

		} else if (interaction.isAutocomplete()) {
			return await this.executeAutocompleteInteraction(interaction);

		} else if (interaction.isButton()) {
			return await this.executeButtonInteraction(interaction);

		} else if (interaction.isStringSelectMenu()) {
			return await this.executeStringSelectMenuInteraction(interaction);

		} else if (interaction.isModalSubmit()) {
			return await this.executeModalSubmitInteraction(interaction);
		}
	},

	async executeChatInputCommandInteraction(interaction: ChatInputCommandInteraction) {
		const client = interaction.client as Client;
		const command = client.commands.get(interaction.commandName);

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
	},

	async executeAutocompleteInteraction(interaction: AutocompleteInteraction) {
		const client = interaction.client as unknown as Client;
		const command = client.commands.get(interaction.commandName);

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
	},

	async executeButtonInteraction(interaction: ButtonInteraction) {
		const client = interaction.client as unknown as Client;
		const componentIndex = ComponentIndex.parse(interaction.customId);
		const button = client.buttons.get(componentIndex.name);

		if (!button) {
			client.logger.error(`Button not found: ${componentIndex.name}`);
			return;
		}

		try {
			await button.handleButton(interaction);
		} catch (error) {
			client.logger.error('Error handling button interaction');
			client.logger.dump(componentIndex);
			client.logger.dump(error);

			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({ content: 'Error processing button click', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.followUp({ content: 'Error processing button click', flags: MessageFlags.Ephemeral });
			}
		}
	},

	async executeStringSelectMenuInteraction(interaction: StringSelectMenuInteraction) {
		const client = interaction.client as unknown as Client;
		const componentIndex = ComponentIndex.parse(interaction.customId);
		const select = client.selects.get(componentIndex.name);

		if (!select) {
			client.logger.error(`Select not found: ${componentIndex.name}`);
			return;
		}

		try {
			await select.handleStringSelectMenu(interaction);
		} catch (error) {
			client.logger.error('Error handling string select menu interaction');
			client.logger.dump(componentIndex);
			client.logger.dump(error);

			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({ content: 'Error processing selections', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.followUp({ content: 'Error processing selections', flags: MessageFlags.Ephemeral });
			}
		}
	},

	async executeModalSubmitInteraction(interaction: ModalSubmitInteraction) {
		const client = interaction.client as unknown as Client;
		const componentIndex = ComponentIndex.parse(interaction.customId);
		const modal = client.modals.get(componentIndex.name);

		if (!modal) {
			client.logger.error(`Modal not found: ${componentIndex.name}`);
			return;
		}

		try {
			await modal.handleModalSubmit(interaction);
		} catch (error) {
			client.logger.error('Error handling modal submit interaction');
			client.logger.dump(componentIndex);
			client.logger.dump(error);
			
			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({ content: 'Error processing submission', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.followUp({ content: 'Error processing submission', flags: MessageFlags.Ephemeral });
			}
		}
	}
};

export default InteractionCreateEvent;