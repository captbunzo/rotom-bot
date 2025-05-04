
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

        const battleRec  = await Battle.get({ messageId: message.id, unique: true });
        const trainerRec = await Trainer.get({id: interaction.user.id, unique: true});

        // Log some stuff for debugging
        client.logger.debug(`Handling Battle Started Button for Message ID = ${message.id}`);
        client.logger.debug(`Action = ${action}`);
        client.logger.debug(`Battle Record = `);
        client.logger.dump(battleRec);
        client.logger.debug(`Trainer Record =`);
        client.logger.dump(trainerRec);

        if (!trainerRec) {
            interaction.reply(Trainer.getSetupTrainerFirstMessage());
            return;
        }
        
        switch (action) {
            case this.data.button.Won: this.handleWonOrFailed(interaction, battleRec, trainerRec, BattleStatus.Completed); break;
            case this.data.button.Failed: this.handleWonOrFailed(interaction, battleRec, trainerRec, BattleStatus.Failed); break;
            case this.data.button.NotReceived: this.handleNotReceived(interaction, battleRec, trainerRec); break;
            case this.data.button.Cancel: this.handleCancel(interaction, battleRec, trainerRec); break;
        }
    },
    async handleWonOrFailed(interaction, battleRec, trainerRec, battleStatus) {
        const client = interaction.client;
        const hostTrainerRec = await Trainer.get({ id: battleRec.hostTrainerId, unique: true });
        
        // Check if this is the host or a battle member reporting battle result
        if (battleRec.hostTrainerId == trainerRec.id) {
            // Update the battle record
            battleRec.status = battleStatus;
            await battleRec.update();

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

            const battleEmbed = await battleRec.buildEmbed();
            await interaction.update({
                embeds: [battleEmbed]
            });

            await interaction.followUp({
                content: `Battle marked as ${battleStatusText}`,
                flags: MessageFlags.Ephemeral
        });
            } else {
            // Update the battle member record
            const battleMemberSearchObj = {
                battleId: battleRec.id,
                trainerId: trainerRec.id,
                unique: true
            };

            const battleMemberRec = await BattleMember.get(battleMemberSearchObj);

            if (!battleMemberRec) {
                await interaction.reply({
                    content: `You have not joined this raid`,
                    flags: MessageFlags.Ephemeral
                });
                return;
            }
            
            let battleStatusText;
            switch (battleStatus) {
                case BattleStatus.Completed:
                    battleMemberRec.status = BattleMemberStatus.Completed;
                    battleStatusText = 'completed';
                    break;
                case BattleStatus.Failed:
                    battleMemberRec.status = BattleMemberStatus.Failed;
                    battleStatusText = 'failed';
                    break;
                default:
                    throw new Error(`Invalid battle status: ${battleStatus}`);
            }
            await battleMemberRec.update();

            await interaction.reply({
                content: `Battle marked as ${battleStatusText}`,
                flags: MessageFlags.Ephemeral
            });
        }
    },

    async handleNotReceived(interaction, battleRec, trainerRec) {
        const client = interaction.client;
        const hostTrainerRec = await Trainer.get({ id: battleRec.hostTrainerId, unique: true });
        
        // Only battle members can click the not received button
        if (battleRec.hostTrainerId == trainerRec.id) {
            await interaction.reply({
                content: `Only battle members can indicate that they did not receive an invite`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Check if this trainer has not joined the raid
        let battleMemberSearchObj = {
            battleId: battleRec.id,
            trainerId: trainerRec.id,
            unique: true
        };
        let battleMemberRec = await BattleMember.get(battleMemberSearchObj);

        if (!battleMemberRec) {
            await interaction.reply({
                content: `You have not joined this raid`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Update the battle member record
        battleMemberRec.status = BattleMemberStatus.NotReceived;
        await battleMemberRec.update();

        await interaction.reply({
            content: `Battle marked as invite not received`, 
            flags: MessageFlags.Ephemeral
        });
    },

    async handleCancel(interaction, battleRec, trainerRec) {
        const client = interaction.client;
        const hostTrainerRec = await Trainer.get({ id: battleRec.hostTrainerId, unique: true });
        
        // Only the host can cancel the raid
        if (battleRec.hostTrainerId != trainerRec.id) {
            await interaction.reply({
                content: `Only the host can cancel this raid`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Update the battle record
        battleRec.status = BattleStatus.Cancelled;
        await battleRec.update();

        const battleEmbed = await battleRec.buildEmbed();
        await interaction.update({
            embeds: [battleEmbed],
            components: []
        });

        // Ping the battle members
        const battleMemberRecs = await BattleMember.get({ battleId: battleRec.id });

        if (battleMemberRecs.length > 0) {
            let battleMemberDiscordPings = [];

            for (const battleMemberRec of battleMemberRecs ) {
                let trainerRec = await Trainer.get({ id: battleMemberRec.trainerId, unique: true });
                battleMemberDiscordPings.push(`<@${trainerRec.id}>`);
            }
            let battleMemberDiscordPingList = battleMemberDiscordPings.join(', ');

            await interaction.followUp({
                content: `${battleMemberDiscordPingList} -- Raid cancelled`
            });
        }
    }
};

export default BattleStartedButtons;
