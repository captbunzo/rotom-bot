import {
    ChatInputCommandInteraction,
    MessageFlags,
    SlashCommandBuilder,
    channelMention,
    roleMention,
} from 'discord.js';

import { BossType } from '@root/src/constants.js';

import type { GuildBattleAlertConditions, GuildBattleAlertData } from '@/types/ModelTypes.js';

import GuildBattleAlert from '@/models/GuildBattleAlert.js';
import Translation from '@/models/Translation.js';

const BattleAlertCmd = {
    global: true,
    data: new SlashCommandBuilder()
        .setName('battle-alert')
        .setDescription('Configure battle alerts')
        .addSubcommand((subCommand) =>
            subCommand
                .setName('create')
                .setDescription('Create a battle alert')
                .addRoleOption((option) =>
                    option
                        .setName('role')
                        .setDescription('Role to alert for these battles')
                        .setRequired(true)
                )
                .addChannelOption((option) =>
                    option
                        .setName('channel')
                        .setDescription('Channel for which to send battle alerts')
                        .setRequired(false)
                )
                .addStringOption((option) =>
                    option
                        .setName('boss-type')
                        .setDescription('Boss Type')
                        .setRequired(false)
                        .addChoices(
                            { name: 'Raid', value: BossType.Raid },
                            { name: 'Dynamax', value: BossType.Dynamax },
                            { name: 'Gigantamax', value: BossType.Gigantamax }
                        )
                )
                .addIntegerOption((option) =>
                    option
                        .setName('tier')
                        .setDescription('Boss Tier')
                        .setRequired(false)
                        .setMinValue(1)
                        .setMaxValue(7)
                )
                .addBooleanOption((option) =>
                    option.setName('mega').setDescription('Mega Boss').setRequired(false)
                )
                .addBooleanOption((option) =>
                    option.setName('shadow').setDescription('Mega Boss').setRequired(false)
                )
        )
        .addSubcommand((subCommand) =>
            subCommand.setName('list').setDescription('List all battle alerts')
        )
        .addSubcommand((subCommand) =>
            subCommand
                .setName('delete')
                .setDescription('Delete a battle alert')
                .addStringOption((option) =>
                    option
                        .setName('id')
                        .setDescription('ID of the battle alert to delete')
                        .setRequired(true)
                )
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        const subCommand = interaction.options.getSubcommand();

        switch (subCommand) {
            case 'create':
                this.executeCreate(interaction);
                break;
            case 'list':
                this.executeList(interaction);
                break;
            case 'delete':
                this.executeDelete(interaction);
                break;
            default:
                await interaction.reply({
                    content: `Battle alert configuration command execution not yet implemented for subcommand -- ${subCommand}`,
                    flags: MessageFlags.Ephemeral,
                });
        }
    },

    /*************************************
     * Subcommand :: Create battle alert *
     *************************************/

    async executeCreate(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new Error('interaction.guild is undefined');
        }

        const guildId = interaction.guild.id;
        const role = interaction.options.getRole('role');
        const channel = interaction.options.getChannel('channel');
        const bossType = interaction.options.getString('boss-type');
        const tier = interaction.options.getInteger('tier');
        const isMega = interaction.options.getBoolean('mega');
        const isShadow = interaction.options.getBoolean('shadow');

        if (!role) {
            throw new Error('Required option role does not have a value');
        }

        // Check if an identical battle role already exists
        const guildBattleAlertSearchObject: GuildBattleAlertConditions = {
            guildId: guildId,
            roleId: role.id,
            channelId: channel !== null ? channel.id : null,
            bossType: bossType,
            tier: tier,
            isMega: isMega,
            isShadow: isShadow,
        };

        let guildBattleAlert = await GuildBattleAlert.getUnique(guildBattleAlertSearchObject);

        if (guildBattleAlert) {
            const guildBattleAlertEmbed = await guildBattleAlert.buildEmbed();
            await interaction.reply({
                content: `A battle alert already exists with the specified parameters`,
                embeds: [guildBattleAlertEmbed],
            });
            return;
        }

        // Create a new battle role
        const guildBattleAlertData: GuildBattleAlertData = {
            guildId: guildId,
            roleId: role.id,
            channelId: channel !== null ? channel.id : null,
            bossType: bossType,
            tier: tier,
            isMega: isMega,
            isShadow: isShadow,
        };
        guildBattleAlert = new GuildBattleAlert(guildBattleAlertData);
        await guildBattleAlert.create();
        const guildBattleAlertEmbed = await guildBattleAlert.buildEmbed();

        await interaction.reply({
            content: `Created battle alert`,
            embeds: [guildBattleAlertEmbed],
        });
    },

    /************************************
     * Subcommand :: List battle alerts *
     ************************************/

    async executeList(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new Error('interaction.guild is undefined');
        }
        const guildId = interaction.guild.id;

        // Get all battle alerts for the guild
        const guildBattleAlerts = await GuildBattleAlert.get({ guildId: guildId });

        if (!guildBattleAlerts || guildBattleAlerts.length === 0) {
            await interaction.reply({
                content: 'No battle alerts have been created',
            });
            return;
        }

        // List all battle alerts
        await interaction.reply({
            content: `## Found ${guildBattleAlerts.length} battle alerts\n\n`,
        });

        for (const guildBattleAlert of guildBattleAlerts) {
            let alertDetails = `### ID: ${guildBattleAlert.id} - ${roleMention(guildBattleAlert.roleId)}\n`;
            alertDetails += `- Channel: ${guildBattleAlert.channelId !== null ? `${channelMention(guildBattleAlert.channelId)}` : 'All'}\n`;
            alertDetails += `- Boss Type: ${guildBattleAlert.bossType !== null ? `${Translation.getBossTypeName(guildBattleAlert.bossType)}` : 'All'}\n`;
            alertDetails += `- Tier: ${guildBattleAlert.tier !== null ? `${guildBattleAlert.tier}` : 'All'}\n`;
            alertDetails += `- Mega: ${guildBattleAlert.isMega !== null ? `${guildBattleAlert.isMega ? 'True' : 'False'}` : 'All'}\n`;
            alertDetails += `- Shadow: ${guildBattleAlert.isShadow !== null ? `${guildBattleAlert.isShadow ? 'True' : 'False'}` : 'All'}\n`;

            await interaction.followUp({
                content: alertDetails,
            });
        }
    },

    /*************************************
     * Subcommand :: Delete battle alert *
     *************************************/

    async executeDelete(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) {
            throw new Error('interaction.guild is undefined');
        }

        const guildId = interaction.guild.id;
        const alertId = interaction.options.getString('id');

        if (!alertId) {
            throw new Error('Required option id does not have a value');
        }

        // Get the battle alert by ID
        const guildBattleAlert = await GuildBattleAlert.getUnique({
            id: alertId,
            guildId: guildId,
        });

        if (!guildBattleAlert) {
            await interaction.reply({
                content: `No battle alert found with ID ${alertId}`,
            });
            return;
        }

        // Delete the battle alert
        await guildBattleAlert.delete();
        await interaction.reply({
            content: `Deleted battle alert with ID ${alertId}`,
        });
    },
};

export default BattleAlertCmd;
