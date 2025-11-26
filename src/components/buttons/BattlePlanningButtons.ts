import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    MessageFlags,
    userMention,
} from 'discord.js';

import { BattleStatus, BattleMemberStatus } from '@root/src/constants.js';

import Client from '@root/src/client.js';

import type { BattleMemberConditions, BattleMemberData } from '@/types/ModelTypes.js';

import Battle from '@/models/Battle.js';
import BattleMember from '@/models/BattleMember.js';
import Boss from '@/models/Boss.js';
import Trainer from '@/models/Trainer.js';

import ComponentIndex from '@/types/ComponentIndex.js';
import BattleResultsButtons from '@/components/buttons/BattleResultsButtons.js';

const BattlePlanningButton = {
    Join: 'Join',
    Leave: 'Leave',
    Start: 'Start',
    Cancel: 'Cancel',
};

const BattlePlanningButtons = {
    name: 'BattlePlanningButtons',
    description: 'Battle planning buttons',

    build(): ActionRowBuilder<ButtonBuilder> {
        const client = Client.getInstance();
        const emoji = client.config.emoji;

        const buttonIndex = new ComponentIndex({
            name: this.name,
            id: 'button',
        });

        // Create the buttons
        buttonIndex.id = BattlePlanningButton.Join;
        const joinButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(BattlePlanningButton.Join)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.join);

        buttonIndex.id = BattlePlanningButton.Leave;
        const leaveButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(BattlePlanningButton.Leave)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.leave);

        buttonIndex.id = BattlePlanningButton.Start;
        const startButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(BattlePlanningButton.Start)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.start);

        buttonIndex.id = BattlePlanningButton.Cancel;
        const cancelButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(BattlePlanningButton.Cancel)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.cancel);

        return new ActionRowBuilder<ButtonBuilder>().addComponents(
            joinButton,
            leaveButton,
            startButton,
            cancelButton
        );
    },

    async handleButton(interaction: ButtonInteraction) {
        const client = interaction.client as Client;
        const message = interaction.message;
        const buttonIndex = ComponentIndex.parse(interaction.customId);
        const action = buttonIndex.id;

        const battle = await Battle.getUnique({ messageId: message.id });
        const trainer = await Trainer.getUnique({ discordId: interaction.user.id });

        if (!battle) {
            throw new Error(`Battle not found for message id ${message.id}`);
        }

        if (!trainer) {
            throw new Error(`Trainer not found for user id ${interaction.user.id}`);
        }

        // Log some stuff for debugging
        client.logger.debug(`Handling Battle Planning Button for Message ID = ${message.id}`);
        client.logger.debug(`Action = ${action}`);
        client.logger.debug(`Battle Record = `);
        client.logger.dump(battle);
        client.logger.debug(`Trainer Record =`);
        client.logger.dump(trainer);

        if (!trainer || !trainer.trainerName || !trainer.code) {
            interaction.reply(Trainer.getSetupTrainerFirstMessage(trainer));
            return;
        }

        switch (action) {
            case BattlePlanningButton.Join:
                this.handleJoinButton(interaction, battle, trainer);
                break;
            case BattlePlanningButton.Leave:
                this.handleLeaveButton(interaction, battle, trainer);
                break;
            case BattlePlanningButton.Start:
                this.handleStartButton(interaction, battle, trainer);
                break;
            case BattlePlanningButton.Cancel:
                this.handleCancelButton(interaction, battle, trainer);
                break;
        }
    },

    async handleJoinButton(interaction: ButtonInteraction, battle: Battle, trainer: Trainer) {
        const client = interaction.client as Client;

        const boss = await Boss.getUnique({ id: battle.bossId });
        const hostTrainer = await Trainer.getUnique({ discordId: battle.hostDiscordId });

        if (!hostTrainer) {
            throw new Error(`Host trainer not found for battle id ${battle.id}`);
        }

        if (!boss) {
            throw new Error(`Boss not found for battle id ${battle.id}`);
        }

        const battleTypeName = boss.battleTypeName;

        // Check if the host is trying to join the raid
        if (
            client.config.options.blockBattleHostSelfJoin &&
            battle.hostDiscordId == trainer.discordId
        ) {
            await interaction.reply({
                content: `You cannot join a ${battleTypeName.toLowerCase()} that you are hosting`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Check if this trainer has already joined the battle
        const battleMemberObj: BattleMemberConditions = {
            battleId: battle.id,
            discordId: trainer.discordId,
        };

        let battleMember = await BattleMember.getUnique(battleMemberObj);
        if (battleMember) {
            await interaction.reply({
                content: `You have already joined this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Join the trainer to this battle
        battleMemberObj.status = BattleMemberStatus.Joined;
        battleMember = new BattleMember(battleMemberObj as BattleMemberData);
        await battleMember.create();

        // Update the embed
        const battleEmbed = await battle.buildEmbed();
        await interaction.update({
            embeds: [battleEmbed],
        });

        await interaction.followUp({
            content:
                `You have joined this ${battleTypeName.toLowerCase()}, please make sure to add the host to your friends list with the following trainer code. ` +
                `Note that Pokémon Go will ignore the text after the numbers.`,
            flags: MessageFlags.Ephemeral,
        });

        await interaction.followUp({
            content: `${hostTrainer.formattedCode} -- ${hostTrainer.trainerName}`,
            flags: MessageFlags.Ephemeral,
        });

        // Debug some stuff
        client.logger.debug(`Interaction Message =`);
        client.logger.dump(interaction.message);
    },

    async handleLeaveButton(interaction: ButtonInteraction, battle: Battle, trainer: Trainer) {
        const client = interaction.client as Client;
        const boss = await Boss.getUnique({ id: battle.bossId });
        if (!boss) {
            throw new Error(`Boss not found for battle id ${battle.id}`);
        }

        const battleTypeName = boss.battleTypeName;

        // Check if the host is trying to leave the raid
        if (
            client.config.options.blockBattleHostSelfJoin &&
            battle.hostDiscordId == trainer.discordId
        ) {
            await interaction.reply({
                content:
                    `You cannot leave a ${battleTypeName.toLowerCase()} that you are hosting, ` +
                    `please click ${BattlePlanningButton.Cancel} to cancel this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Check if this trainer has not yet joined the raid
        const battleMemberObj: BattleMemberConditions = {
            battleId: battle.id,
            discordId: trainer.discordId,
        };

        const battleMember = await BattleMember.getUnique(battleMemberObj);
        if (!battleMember) {
            await interaction.reply({
                content: `You have not yet joined this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Remove the trainer from this raid
        await battleMember.delete();

        //await client.channels.fetch(interaction.message.channelId);

        // Update the embed (noting we have to make sure the channel is in the cache first)
        const battleEmbed = await battle.buildEmbed();
        await interaction.update({
            embeds: [battleEmbed],
        });

        await interaction.followUp({
            content: `You have left this ${battleTypeName.toLowerCase()}`,
            flags: MessageFlags.Ephemeral,
        });

        // Debug some stuff
        client.logger.debug(`Interaction Message =`);
        client.logger.dump(interaction.message);
    },

    async handleStartButton(interaction: ButtonInteraction, battle: Battle, trainer: Trainer) {
        const boss = await Boss.getUnique({ id: battle.bossId });
        if (!boss) {
            throw new Error(`Boss not found for battle id ${battle.id}`);
        }

        const battleTypeName = boss.battleTypeName;

        // Only the host can cancel the raid
        if (battle.hostDiscordId != trainer.discordId) {
            await interaction.reply({
                content: `Only the host can cancel this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Collect the battle members
        const battleMembers = await BattleMember.get({ battleId: battle.id });

        if (battleMembers.length == 0) {
            await interaction.reply({
                content: `You must have at least one battle member to start the ${battleTypeName.toLowerCase()}, perhaps cancel instead?`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Update the battle status
        battle.status = BattleStatus.Started;
        await battle.update();

        // Update the battle message
        const battleEmbed = await battle.buildEmbed();
        const battleResultsButtons = BattleResultsButtons.build();

        await interaction.update({
            embeds: [battleEmbed],
            components: [battleResultsButtons],
        });

        // Get battle member details together
        const battleMemberTrainerNames = [];
        const battleMemberDiscordPings = [];

        for (const battleMember of battleMembers) {
            const battleMemberTrainer = await Trainer.getUnique({
                discordId: battleMember.discordId,
            });
            if (!battleMemberTrainer) {
                continue;
            }

            battleMemberTrainerNames.push(battleMemberTrainer.trainerName);
            battleMemberDiscordPings.push(userMention(battleMemberTrainer.discordId));
        }
        const battleMemberTrainerList = battleMemberTrainerNames.join(',');
        const battleMemberDiscordPingList = battleMemberDiscordPings.join(', ');

        // Ping the battle members
        await interaction.followUp({
            content: `${battleMemberDiscordPingList} -- ${battleTypeName} started, please look for a invite from ${trainer.trainerName}`,
        });

        // Message the host with the battle member trainer names
        await interaction.followUp({
            content: `Please use the following text to invite battle members`,
            flags: MessageFlags.Ephemeral,
        });

        await interaction.followUp({
            content: battleMemberTrainerList,
            flags: MessageFlags.Ephemeral,
        });
    },

    async handleCancelButton(interaction: ButtonInteraction, battle: Battle, trainer: Trainer) {
        const boss = await Boss.getUnique({ id: battle.bossId });
        if (!boss) {
            throw new Error(`Boss not found for boss id ${battle.bossId}`);
        }
        const battleTypeName = boss.battleTypeName;

        // Only the host can cancel the raid
        if (battle.hostDiscordId != trainer.discordId) {
            await interaction.reply({
                content: `Only the host can cancel this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Delete the battle members
        //const battleMembers = await BattleMember.get({ battleId: battle.id } as BattleConditions);
        //for (const battleMembe of battleMembers ) {
        //    await battleMember.delete();
        //}

        // Update the battle record
        battle.status = BattleStatus.Cancelled;
        await battle.update();

        // Delete the message (noting we have to make sure the channel is in the cache first)
        //client.logger.debug(`Channel ID = ${interaction.message.channelId}`);
        //await client.channels.fetch(interaction.message.channelId);
        //client.logger.debug(`Deleting message`);

        // TODO - If I ever need to actually delete a reply, do deferUpdate() and deleteReply() instead of message.delete()
        //await interaction.message.delete();
        //await interaction.deferUpdate();
        //await interaction.deleteReply();
        //
        //await interaction.followUp({
        //    content: `Raid cancelled`
        //});

        const battleEmbed = await battle.buildEmbed();
        await interaction.update({
            embeds: [battleEmbed],
            components: [],
        });

        // Ping the battle members
        const battleMembers = await BattleMember.get({ battleId: battle.id });

        if (battleMembers.length > 0) {
            const battleMemberDiscordPings = [];

            for (const battleMember of battleMembers) {
                const battleMemberTrainer = await Trainer.getUnique({
                    discordId: battleMember.discordId,
                });
                if (!battleMemberTrainer) {
                    continue;
                }
                battleMemberDiscordPings.push(userMention(battleMemberTrainer.discordId));
            }
            const battleMemberDiscordPingList = battleMemberDiscordPings.join(', ');

            await interaction.followUp({
                content: `${battleMemberDiscordPingList} -- ${battleTypeName} cancelled`,
            });
        }
    },
};

export default BattlePlanningButtons;
