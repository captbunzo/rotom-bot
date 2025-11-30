import type { Interaction } from 'discord.js';

import {
    AutocompleteInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Events,
    MessageFlags,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import type { Event } from '@/types/event';
import type { Client } from '@/client';
import { ComponentIndex } from '@/types/component-index.js';
import { t } from '@/i18n/index.js';

export class InteractionCreateEvent implements Event {
    name = Events.InteractionCreate;
    once = false;

    async execute(interaction: Interaction) {
        if (interaction.isChatInputCommand()) {
            await this.executeChatInputCommandInteraction(interaction);
            return;
        }

        if (interaction.isAutocomplete()) {
            await this.executeAutocompleteInteraction(interaction);
            return;
        }

        if (interaction.isButton()) {
            await this.executeButtonInteraction(interaction);
            return;
        }

        if (interaction.isStringSelectMenu()) {
            await this.executeStringSelectMenuInteraction(interaction);
            return;
        }

        if (interaction.isModalSubmit()) {
            await this.executeModalSubmitInteraction(interaction);
            return;
        }
    }

    async executeChatInputCommandInteraction(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as Client;
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            client.logger.error(`No command matching ${interaction.commandName} was found`);
            return;
        }

        // if (!command.execute) {
        //     client.logger.error(
        //         `Command ${interaction.commandName} does not have an execute function`
        //     );
        //     return;
        // }

        try {
            await command.execute(interaction);
        } catch (error) {
            client.logger.error(`Error executing command ${interaction.commandName}`);
            client.logger.dump(error);

            await (interaction.replied || interaction.deferred
                ? interaction.followUp({
                      content: t('errors.commandExecution'),
                      flags: MessageFlags.Ephemeral,
                  })
                : interaction.reply({
                      content: t('errors.commandExecution'),
                      flags: MessageFlags.Ephemeral,
                  }));
        }
    }

    async executeAutocompleteInteraction(interaction: AutocompleteInteraction) {
        const client = interaction.client as unknown as Client;
        const command = client.commands.get(interaction.commandName);

        if (!command) {
            client.logger.error(`No command matching ${interaction.commandName} was found`);
            return;
        }

        if (!command.autocomplete) {
            client.logger.error(
                `Command ${interaction.commandName} does not have an autocomplete function`
            );
            return;
        }

        try {
            await command.autocomplete(interaction);
        } catch (error) {
            client.logger.error(`Error autocompleting command ${interaction.commandName}`);
            client.logger.dump(error);
        }
    }

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

            await (!interaction.replied && !interaction.deferred
                ? interaction.reply({
                      content: t('errors.buttonProcessing'),
                      flags: MessageFlags.Ephemeral,
                  })
                : interaction.followUp({
                      content: t('errors.buttonProcessing'),
                      flags: MessageFlags.Ephemeral,
                  }));
        }
    }

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

            await (!interaction.replied && !interaction.deferred
                ? interaction.reply({
                      content: t('errors.selectionProcessing'),
                      flags: MessageFlags.Ephemeral,
                  })
                : interaction.followUp({
                      content: t('errors.selectionProcessing'),
                      flags: MessageFlags.Ephemeral,
                  }));
        }
    }

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

            await (!interaction.replied && !interaction.deferred
                ? interaction.reply({
                      content: t('errors.submissionProcessing'),
                      flags: MessageFlags.Ephemeral,
                  })
                : interaction.followUp({
                      content: t('errors.submissionProcessing'),
                      flags: MessageFlags.Ephemeral,
                  }));
        }
    }
}

export const event = new InteractionCreateEvent();
