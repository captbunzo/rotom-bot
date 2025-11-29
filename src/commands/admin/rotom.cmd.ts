import { ChatInputCommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';

import type { Command } from '@/types/command';
import type { Client } from '@/client.js';
import { BotReturnCode } from '@/constants.js';
import { t } from '@/i18n/index.js';

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

class RotomCmd implements Command {
    global = false;

    data = new SlashCommandBuilder()
        .setName('rotom')
        .setDescription(t('commands.rotom.description'))
        .addSubcommand((subCommand) =>
            subCommand
                .setName('restart')
                .setDescription(t('commands.rotom.restart.description'))
        )
        .addSubcommand((subCommand) =>
            subCommand.setName('stop').setDescription(t('commands.rotom.stop.description'))
        )
        .addSubcommand((subCommand) =>
            subCommand
                .setName('deploy-commands')
                .setDescription(t('commands.rotom.deployCommands.description'))
        )
        .addSubcommand((subCommand) =>
            subCommand.setName('ping').setDescription(t('commands.rotom.ping.description'))
        );

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
                    content: t('commands.rotom.notImplemented', { subCommand }),
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
            content: subCommand === 'restart' ? t('bot.restarting') : t('bot.stopping'),
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

        await interaction.reply({
            content: t('commands.rotom.deployCommands.deploying'),
            flags: MessageFlags.Ephemeral,
        });
        await client.deployCommands();
        await interaction.followUp({
            content: t('commands.rotom.deployCommands.deployed'),
            flags: MessageFlags.Ephemeral,
        });
    }

    /*******************************/
    /* Subcommand :: Ping Commands */
    /*******************************/

    async executePing(interaction: ChatInputCommandInteraction) {
        await interaction.reply({ content: t('bot.alive') });
        await sleep(2000);
        await interaction.editReply({ content: t('bot.stillAlive') });
    }
}

export const command = new RotomCmd();
