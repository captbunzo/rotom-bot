
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} from 'discord.js';

import {
    BattleStatus,
    BattleMemberStatus
} from '../Constants.js';

import Battle       from '../data/Battle.js';
import BattleMember from '../data/BattleMember.js';
import Boss from '../data/Boss.js';
import Trainer      from '../data/Trainer.js';

const BattleStartedButtons = {
    data: {
        name: 'BattleStartedButtons',
        description: 'Battle started buttons',
        button: {
            Won: 'Battle Won',
            Failed: 'Battle Failed',
            NotReceived: 'Invite Not Received',
            Cancel: 'Cancel'
        }
    },  

    async build(interaction) {
        // Create the buttons
        const wonButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${this.data.button.Won}`)
            .setLabel(this.data.button.Won)
            .setStyle(ButtonStyle.Success);
        
        const failedButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${this.data.button.Failed}`)
            .setLabel(this.data.button.Failed)
            .setStyle(ButtonStyle.Danger);

        const notReceivedButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${this.data.button.NotReceived}`)
            .setLabel(this.data.button.NotReceived)
            .setStyle(ButtonStyle.Secondary);
        
        const cancelButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${this.data.button.Cancel}`)
            .setLabel(this.data.button.Cancel)
            .setStyle(ButtonStyle.Secondary);
        
        return new ActionRowBuilder()
            .addComponents(wonButton, failedButton, notReceivedButton, cancelButton);
    },
    
    async handle(interaction) {
        const client = interaction.client;
        const message = interaction.message;
        const action = interaction.customId.split('.')[1];

        const battle  = await Battle.get({ messageId: message.id, unique: true });
        const trainer = await Trainer.get({ id: interaction.user.id, unique: true });

        // Log some stuff for debugging
        client.logger.debug(`Handling Battle Started Button for Message ID = ${message.id}`);
        client.logger.debug(`Action = ${action}`);
        client.logger.debug(`Battle Record = `);
        client.logger.dump(battle);
        client.logger.debug(`Trainer Record =`);
        client.logger.dump(trainer);

        if (!trainer) {
            interaction.reply(Trainer.getSetupTrainerFirstMessage());
            return;
        }
        
        switch (action) {
            case this.data.button.Won: this.handleWonOrFailed(interaction, battle, trainer, BattleStatus.Completed); break;
            case this.data.button.Failed: this.handleWonOrFailed(interaction, battle, trainer, BattleStatus.Failed); break;
            case this.data.button.NotReceived: this.handleNotReceived(interaction, battle, trainer); break;
            case this.data.button.Cancel: this.handleCancel(interaction, battle, trainer); break;
        }
    },
    async handleWonOrFailed(interaction, battle, trainer, battleStatus) {
        const client = interaction.client;
        const boss = await Boss.get({ id: battle.bossId, unique: true });
        const battleTypeName = boss.battleTypeName;
        
        // Check if this is the host or a battle member reporting battle result
        if (battle.hostTrainerId == trainer.id) {
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
            const battleMemberSearchObj = {
                battleId: battle.id,
                trainerId: trainer.id,
                unique: true
            };

            const battleMember = await BattleMember.get(battleMemberSearchObj);

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

    async handleNotReceived(interaction, battle, trainer) {
        const client = interaction.client;
        const boss = await Boss.get({ id: battle.bossId, unique: true });
        const battleTypeName = boss.battleTypeName;
        
        // Only battle members can click the not received button
        if (battle.hostTrainerId == trainer.id) {
            await interaction.reply({
                content: `Only battle members can indicate that they did not receive an invite`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Check if this trainer has not joined the raid
        const battleMemberSearchObj = {
            battleId: battle.id,
            trainerId: trainer.id,
            unique: true
        };
        const battleMember = await BattleMember.get(battleMemberSearchObj);

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

    async handleCancel(interaction, battle, trainer) {
        const client = interaction.client;
        const boss = await Boss.get({ id: battle.bossId, unique: true });
        const battleTypeName = boss.battleTypeName;
        
        // Only the host can cancel the raid
        if (battle.hostTrainerId != trainer.id) {
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

            for (const battleMemberRec of battleMembers ) {
                const battleMemberTrainer = await Trainer.get({ id: battleMemberRec.trainerId, unique: true });
                battleMemberDiscordPings.push(`<@${battleMemberTrainer.id}>`);
            }
            const battleMemberDiscordPingList = battleMemberDiscordPings.join(', ');

            await interaction.followUp({
                content: `${battleMemberDiscordPingList} -- ${battleTypeName} cancelled`
            });
        }
    }
};

export default BattleStartedButtons;
