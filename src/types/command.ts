import type {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from 'discord.js';

/**
 * Command Module Interface
 */
export interface CommandModule {
    command: Command;
}

/**
 * Command Interface
 *
 * @property {boolean} global - Whether the command is global or guild-specific
 * @property {SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder} data - The command data builder
 * @property {(interaction: ChatInputCommandInteraction) => Promise<void>} execute - The function to execute the command
 * @property {(interaction: AutocompleteInteraction) => Promise<void>} [autocomplete] - Optional function to handle autocomplete interactions
 */
export interface Command {
    global: boolean;
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
    autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}
