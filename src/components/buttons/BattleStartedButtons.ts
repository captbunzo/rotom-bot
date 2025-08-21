import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    MessageFlags,
    userMention
} from 'discord.js';

import {
    BattleStatus,
    BattleMemberStatus
} from '#src/Constants.js';

import Client from '#src/Client.js';

import type {
    BattleMemberConditions
} from '#src/types/ModelTypes.js';

import Battle       from '#src/models/Battle.js';
import BattleMember from '#src/models/BattleMember.js';
import Boss         from '#src/models/Boss.js';
import Trainer      from '#src/models/Trainer.js';

const BattleStartedButtons = {
    name: 'BattleStartedButtons',
    description: 'Battle started buttons',
    button: {
        Won: 'Battle Won',
        Failed: 'Battle Failed',
        NotReceived: 'Invite Not Received',
        Cancel: 'Cancel'
    },

    build(): ActionRowBuilder<ButtonBuilder> {
        // Create the buttons
        const wonButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${this.button.Won}`)
            .setLabel(this.button.Won)
            .setStyle(ButtonStyle.Success);
        
        const failedButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${this.button.Failed}`)
            .setLabel(this.button.Failed)
            .setStyle(ButtonStyle.Danger);

        const notReceivedButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${this.button.NotReceived}`)
            .setLabel(this.button.NotReceived)
            .setStyle(ButtonStyle.Secondary);
        
        const cancelButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${this.button.Cancel}`)
            .setLabel(this.button.Cancel)
            .setStyle(ButtonStyle.Secondary);
        
        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(wonButton, failedButton, notReceivedButton, cancelButton);
    },
    
    async handleButton(interaction: ButtonInteraction) {
        const client = interaction.client as Client;
        const message = interaction.message;
        const action = interaction.customId.split('.')[1];

        const battle  = await Battle.getUnique({ messageId: message.id });
        const trainer = await Trainer.getUnique({ discordId: interaction.user.id });

        // Log some stuff for debugging
        client.logger.debug(`Handling Battle Started Button for Message ID = ${message.id}`);
        client.logger.debug(`Action = ${action}`);
        client.logger.debug(`Battle Record = `);
        client.logger.dump(battle);
        client.logger.debug(`Trainer Record =`);
        client.logger.dump(trainer);

        if (!battle) {
            throw new Error(`Battle not found for message id ${message.id}`);
        }

        if (!trainer) {
            interaction.reply(Trainer.getSetupTrainerFirstMessage());
            return;
        }
        
        switch (action) {
            case this.button.Won: this.handleWonOrFailedButton(interaction, battle, trainer, BattleStatus.Completed); break;
            case this.button.Failed: this.handleWonOrFailedButton(interaction, battle, trainer, BattleStatus.Failed); break;
            case this.button.NotReceived: this.handleNotReceivedButton(interaction, battle, trainer); break;
            case this.button.Cancel: this.handleCancelButton(interaction, battle, trainer); break;
        }
    },

    async handleWonOrFailedButton(interaction: ButtonInteraction, battle: Battle, trainer: Trainer, battleStatus: string) {
        const boss = await Boss.getUnique({ id: battle.bossId });
        if (!boss) {
            throw new Error(`Boss not found for boss id ${battle.bossId}`);
        }
        const battleTypeName = boss.battleTypeName;
        
        // Check if this is the host or a battle member reporting battle result
        if (battle.hostDiscordId == trainer.discordId) {
            // Update the battle record
            battle.status = battleStatus;
            await battle.update();

            let battleStatusText;
            switch (battleStatus) {
                case BattleStatus.Completed:
                    battleStatusText = 'completed';
                    break;
                case BattleStatus.Failed:
                    battleStatusText = 'failed';
                    break;
                default:
                    throw new Error(`Invalid battle status: ${battleStatus}`);
            }

            const battleEmbed = await battle.buildEmbed();
            await interaction.update({
                embeds: [battleEmbed]
            });

            await interaction.followUp({
                content: `${battleTypeName} marked as ${battleStatusText}`,
                flags: MessageFlags.Ephemeral
        });
            } else {
            // Update the battle member record
            const battleMemberSearchObj: BattleMemberConditions = {
                battleId: battle.id,
                discordId: trainer.discordId
            };

            const battleMember = await BattleMember.getUnique(battleMemberSearchObj);

            if (!battleMember) {
                await interaction.reply({
                    content: `You have not joined this ${battleTypeName.toLowerCase()}`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
            
            let battleStatusText;
            switch (battleStatus) {
                case BattleStatus.Completed:
                    battleMember.status = BattleMemberStatus.Completed;
                    battleStatusText = 'completed';
                    break;
                case BattleStatus.Failed:
                    battleMember.status = BattleMemberStatus.Failed;
                    battleStatusText = 'failed';
                    break;
                default:
                    throw new Error(`Invalid battle status: ${battleStatus}`);
            }
            await battleMember.update();

            await interaction.reply({
                content: `${battleTypeName} marked as ${battleStatusText}`,
                flags: MessageFlags.Ephemeral
            });
        }
    },

    async handleNotReceivedButton(interaction: ButtonInteraction, battle: Battle, trainer: Trainer) {
        const boss = await Boss.getUnique({ id: battle.bossId });
        if (!boss) {
            throw new Error(`Boss not found for boss id ${battle.bossId}`);
        }
        const battleTypeName = boss.battleTypeName;
        
        // Only battle members can click the not received button
        if (battle.hostDiscordId == trainer.discordId) {
            await interaction.reply({
                content: `Only battle members can indicate that they did not receive an invite`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Check if this trainer has not joined the raid
        const battleMemberSearchObj: BattleMemberConditions = {
            battleId: battle.id,
            discordId: trainer.discordId
        };
        const battleMember = await BattleMember.getUnique(battleMemberSearchObj);

        if (!battleMember) {
            await interaction.reply({
                content: `You have not joined this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Update the battle member record
        battleMember.status = BattleMemberStatus.NotReceived;
        await battleMember.update();

        await interaction.reply({
            content: `${battleTypeName} marked as invite not received`, 
            flags: MessageFlags.Ephemeral
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
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Update the battle record
        battle.status = BattleStatus.Cancelled;
        await battle.update();

        const battleEmbed = await battle.buildEmbed();
        await interaction.update({
            embeds: [battleEmbed],
            components: []
        });

        // Ping the battle members
        const battleMembers = await BattleMember.get({ battleId: battle.id });

        if (battleMembers.length > 0) {
            const battleMemberDiscordPings = [];

            for (const battleMember of battleMembers ) {
                const battleMemberTrainer = await Trainer.getUnique({ discordId: battleMember.discordId });
                if (!battleMemberTrainer) {
                    continue;
                }
                battleMemberDiscordPings.push(userMention(battleMemberTrainer.discordId));
            }
            const battleMemberDiscordPingList = battleMemberDiscordPings.join(', ');

            await interaction.followUp({
                content: `${battleMemberDiscordPingList} -- ${battleTypeName} cancelled`
            });
        }
    }
};

export default BattleStartedButtons;