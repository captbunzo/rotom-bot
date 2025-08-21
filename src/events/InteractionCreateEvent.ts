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

interface ComponentId {
    name: string;
    type: string;
}

const InteractionCreateEvent = {
	name: Events.InteractionCreate,

	async execute(interaction: Interaction) {
		if (interaction.isChatInputCommand() ) {
			await this.executeChatInputCommandInteraction(interaction);

		} else if (interaction.isAutocomplete()) {
			await this.executeAutocompleteInteraction(interaction);

		} else if (interaction.isButton()) {
			await this.executeButtonInteraction(interaction);
		
		} else if (interaction.isStringSelectMenu()) {
			await this.executeStringSelectMenuInteraction(interaction);

		} else if (interaction.isModalSubmit()) {
			await this.executeModalSubmitInteraction(interaction);
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
		const buttonName = interaction.customId.split('.')[0];

		if (!buttonName) {
			throw new Error('Button interaction does not have a valid custom ID');
		}
		
		const button = client.buttons.get(buttonName);

		if (!button) {
			client.logger.error(`No button matching ${buttonName} was found`);
			return;
		}

		try {
			await button.handleButton(interaction);
		} catch (error) {
			client.logger.error(`Error handling button ${buttonName}`);
			client.logger.dump(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while handling this button!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while handling this button!', flags: MessageFlags.Ephemeral });
			}
		}
	},

	async executeStringSelectMenuInteraction(interaction: StringSelectMenuInteraction) {
		const client = interaction.client as unknown as Client;
		const customId = JSON.parse(interaction.customId);
		const selectName = customId.name;

		if (!selectName) {
			throw new Error('Select interaction does not have a valid custom ID');
		}

		const select = client.selects.get(selectName);

		if (!select) {
			client.logger.error(`No select matching ${selectName} was found`);
			return;
		}

		try {
			await select.handleStringSelectMenu(interaction);
		} catch (error) {
			client.logger.error(`Error handling select ${selectName}`);
			client.logger.dump(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while handling this select!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while handling this select!', flags: MessageFlags.Ephemeral });
			}
		}
	},

	async executeModalSubmitInteraction(interaction: ModalSubmitInteraction) {
		const client = interaction.client as unknown as Client;
		const modal = client.modals.get(interaction.customId);

		if (!modal) {
			client.logger.error(`No modal matching ${interaction.customId} was found`);
			return;
		}

		try {
			await modal.handleModalSubmit(interaction);
		} catch (error) {
			client.logger.error(`Error submitting model ${interaction.customId}`);
			client.logger.dump(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while handling this modal!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while handling this modal!', flags: MessageFlags.Ephemeral });
			}
		}
	}
};

export default InteractionCreateEvent;