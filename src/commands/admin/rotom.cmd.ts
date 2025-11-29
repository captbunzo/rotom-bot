import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

import type { Command } from '@/types/command';
import type { Client } from '@/client.js';
import { BotReturnCode } from '@/constants.js';

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class RotomCmd implements Command {
    global = false;

    data = new SlashCommandBuilder()
        .setName('rotom')
        .setDescription('Manage Rotom bot')
        .addSubcommand((subCommand) =>
            subCommand.setName('restart').setDescription('Restart Rotom bot')
        )
        .addSubcommand((subCommand) => subCommand.setName('stop').setDescription('Stop Rotom bot'))
        .addSubcommand((subCommand) =>
            subCommand.setName('deploy-commands').setDescription('Deploy Rotom commands')
        )
        .addSubcommand((subCommand) => subCommand.setName('ping').setDescription('Ping Rotom bot'));

    async execute(interaction: ChatInputCommandInteraction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'restart': {
                void this.executeRestartStop(interaction, subCommand);
                break;
            }
            case 'stop': {
                void this.executeRestartStop(interaction, subCommand);
                break;
            }
            case 'deploy-commands': {
                void this.executeDeployCommands(interaction);
                break;
            }
            case 'ping': {
                void this.executePing(interaction);
                break;
            }
            default: {
                await interaction.reply({
                    content: `Rotom management command execution not yet implemented for subcommand -- ${subCommand}`,
                    flags: MessageFlags.Ephemeral,
                });
            }
        }
    }

    /********************************/
    /* Subcommand :: Restart / Stop */
    /********************************/

    async executeRestartStop(interaction: ChatInputCommandInteraction, subCommand: string) {
        await interaction.reply({
            content: `${subCommand === 'restart' ? 'Restarting' : 'Stopping'} Rotom bot`,
            flags: MessageFlags.Ephemeral,
        });

        await interaction.client.destroy();
        process.exit(subCommand === 'restart' ? BotReturnCode.Restart : BotReturnCode.Success);
    }

    /*********************************/
    /* Subcommand :: Deploy Commands */
    /*********************************/

    // TODO - Edit client.deployCommands() to provide feedback on command deployment back to the user in discord

    async executeDeployCommands(interaction: ChatInputCommandInteraction) {
        const client = interaction.client as Client;

        await interaction.reply({ content: `Deploying commands`, flags: MessageFlags.Ephemeral });
        await client.deployCommands();
        await interaction.followUp({ content: `Commands deployed`, flags: MessageFlags.Ephemeral });
    }

    /*******************************/
    /* Subcommand :: Ping Commands */
    /*******************************/

    async executePing(interaction: ChatInputCommandInteraction) {
        await interaction.reply({ content: 'Rotom is alive!' });
        await sleep(2000);
        await interaction.editReply({ content: 'Rotom is still alive!!' });
    }
}

export const command = new RotomCmd();
