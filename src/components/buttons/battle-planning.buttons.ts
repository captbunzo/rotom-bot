import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    MessageFlags,
    userMention,
    ChatInputCommandInteraction,
    ModalSubmitInteraction,
} from 'discord.js';

import { battlesConfig } from '@/config/battles.config';

import { BattleStatus, MessageType } from '@/constants';
import { ComponentIndex } from '@/types/component-index';
import type { ButtonsComponent } from '@/types/component';

import type { Battle } from '@/database/entities/battle.entity';
import type { Trainer } from '@/database/entities/trainer.entity';

import { BattleService } from '@/services/battle.service';
import { BattleMemberService } from '@/services/battle-member.service';
import { BossService } from '@/services/boss.service';
import { TrainerService } from '@/services/trainer.service';

import { BattleResultsButtons } from '@/components/buttons/battle-results.buttons';
import { emoji } from '@/utils/emoji';

import { BattleMemberNotFoundError } from '@/types/errors/battle-member-not-found.error';

const BattlePlanningButton = {
    Join: 'Join',
    Leave: 'Leave',
    Start: 'Start',
    Cancel: 'Cancel',
};

export class BattlePlanningButtons implements ButtonsComponent {
    name = 'BattlePlanningButtons';
    id = 'button';
    description = 'Battle planning buttons';

    async show(
        interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
        messageType = MessageType.Reply
    ) {
        const buttonIndex = new ComponentIndex({
            name: this.name,
            id: this.id,
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

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            joinButton,
            leaveButton,
            startButton,
            cancelButton
        );

        if (messageType === MessageType.Reply) {
            await interaction.reply({
                content: 'Battle planning options:',
                components: [buttonRow],
                flags: MessageFlags.Ephemeral,
            });
        } else if (messageType === MessageType.FollowUp) {
            await interaction.followUp({
                content: 'Battle planning options:',
                components: [buttonRow],
                flags: MessageFlags.Ephemeral,
            });
        }
    }

    async handleButton(interaction: ButtonInteraction) {
        const message = interaction.message;
        const buttonIndex = ComponentIndex.parse(interaction.customId);
        const action = buttonIndex.id;

        const battle = await BattleService.getByMessageId(message.id);

        if (!battle) {
            throw new Error(`Battle not found for message id ${message.id}`);
        }

        const trainer = await TrainerService.get(interaction.user.id);
        if (!trainer || !trainer.trainerName || !trainer.code) {
            await interaction.reply(TrainerService.getSetupTrainerFirstMessage(trainer));
            return;
        }

        switch (action) {
            case BattlePlanningButton.Join: {
                await this.handleJoinButton(interaction, battle, trainer);
                break;
            }
            case BattlePlanningButton.Leave: {
                await this.handleLeaveButton(interaction, battle, trainer);
                break;
            }
            case BattlePlanningButton.Start: {
                await this.handleStartButton(interaction, battle, trainer);
                break;
            }
            case BattlePlanningButton.Cancel: {
                await this.handleCancelButton(interaction, battle, trainer);
                break;
            }
        }
    }

    private async handleJoinButton(
        interaction: ButtonInteraction,
        battle: Battle,
        trainer: Trainer
    ) {
        const boss = await BossService.get(battle.bossId);
        const hostTrainer = await TrainerService.get(battle.hostDiscordId);

        if (!boss) {
            throw new Error(`Boss not found for battle id ${battle.id}`);
        }

        if (!hostTrainer) {
            throw new Error(`Host trainer not found for battle id ${battle.id}`);
        }

        const battleTypeName = BossService.getBattleTypeName(boss);

        // Check if this trainer has joined the battle
        let battleMember = await BattleMemberService.get(battle.id, trainer.discordId);

        if (battleMember) {
            await interaction.reply({
                content: `You have already joined this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Check if the host is trying to join their own battle and if this is allowed
        if (battle.hostDiscordId === trainer.discordId && battlesConfig.blockHostSelfJoin) {
            await interaction.reply({
                content: `As the host, you are already part of this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Join the trainer to this battle
        await BattleMemberService.joinBattle(battle, trainer);

        // Update the embed
        const battleEmbed = await BattleService.buildEmbed(battle);
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
            content: `${TrainerService.formatTrainerCode(hostTrainer.code)} -- ${hostTrainer.trainerName}`,
            flags: MessageFlags.Ephemeral,
        });
    }

    private async handleLeaveButton(
        interaction: ButtonInteraction,
        battle: Battle,
        trainer: Trainer
    ) {
        const boss = await BossService.get(battle.bossId);
        if (!boss) {
            throw new Error(`Boss not found for battle id ${battle.id}`);
        }

        const battleTypeName = BossService.getBattleTypeName(boss);

        try {
            await BattleMemberService.leaveBattle(battle, trainer);
        } catch (error) {
            if (error instanceof BattleMemberNotFoundError) {
                await interaction.reply({
                    content: `You have not yet joined this ${battleTypeName.toLowerCase()}`,
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }
            throw error;
        }

        // Update the embed
        const battleEmbed = await BattleService.buildEmbed(battle);
        await interaction.update({
            embeds: [battleEmbed],
        });

        await interaction.followUp({
            content: `You have left this ${battleTypeName.toLowerCase()}`,
            flags: MessageFlags.Ephemeral,
        });
    }

    private async handleStartButton(
        interaction: ButtonInteraction,
        battle: Battle,
        trainer: Trainer
    ) {
        const boss = await BossService.get(battle.bossId);

        if (!boss) {
            throw new Error(`Boss not found for battle id ${battle.id}`);
        }

        const battleTypeName = BossService.getBattleTypeName(boss);

        // Only the host can start the battle
        if (battle.hostDiscordId !== trainer.discordId) {
            await interaction.reply({
                content: `Only the host can start this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Collect the battle members
        const battleMembers = await BattleMemberService.getByBattleId(battle.id);

        if (battleMembers.length === 0) {
            await interaction.reply({
                content: `You must have at least one battle member to start the ${battleTypeName.toLowerCase()}, perhaps cancel instead?`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Update the battle status
        battle.status = BattleStatus.Started;
        await BattleService.update(battle);

        // Update the battle message
        const battleEmbed = await BattleService.buildEmbed(battle);
        const battleResultsButtons = new BattleResultsButtons();

        await interaction.update({
            embeds: [battleEmbed],
            components: [await battleResultsButtons.buildActionRow()],
        });

        // Get battle member details together
        const battleMemberTrainerNames = [];
        const battleMemberDiscordPings = [];

        for (const battleMember of battleMembers) {
            const battleMemberTrainer = await TrainerService.get(battleMember.discordId);

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
    }

    private async handleCancelButton(
        interaction: ButtonInteraction,
        battle: Battle,
        trainer: Trainer
    ) {
        const boss = await BossService.get(battle.bossId);
        if (!boss) {
            throw new Error(`Boss not found for boss id ${battle.bossId}`);
        }

        const battleTypeName = BossService.getBattleTypeName(boss);

        // Only the host can cancel the raid
        if (battle.hostDiscordId !== trainer.discordId) {
            await interaction.reply({
                content: `Only the host can cancel this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        // Update the battle record
        battle.status = BattleStatus.Cancelled;
        await BattleService.update(battle);

        const battleEmbed = await BattleService.buildEmbed(battle);
        await interaction.update({
            embeds: [battleEmbed],
            components: [],
        });

        // Ping the battle members
        const battleMembers = await BattleMemberService.getByBattleId(battle.id);

        if (battleMembers.length > 0) {
            const battleMemberDiscordPings = [];

            for (const battleMember of battleMembers) {
                const battleMemberTrainer = await TrainerService.get(battleMember.discordId);

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
    }

    buildActionRow() {
        const buttonIndex = new ComponentIndex({
            name: this.name,
            id: this.id,
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
    }
}

export const component = new BattlePlanningButtons();
