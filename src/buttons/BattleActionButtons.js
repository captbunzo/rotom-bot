
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} from 'discord.js';

import Battle       from '../data/Battle.js';
import BattleMember from '../data/BattleMember.js';
import Trainer      from '../data/Trainer.js';

const BattleActionButtons = {
    data: {
        name: 'BattleAction',
        button: {
            Join: 'Join',
            Leave: 'Leave',
            Start: 'Start',
            Cancel: 'Cancel'
        }       
    },

    async build(interaction) {
        // Create the buttons
        const joinButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${this.data.button.Join}`)
            .setLabel(this.data.button.Join)
            .setStyle(ButtonStyle.Primary);
        
        const leaveButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${this.data.button.Leave}`)
            .setLabel(this.data.button.Leave)
            .setStyle(ButtonStyle.Secondary);

        const startButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${this.data.button.Start}`)
            .setLabel(this.data.button.Start)
            .setStyle(ButtonStyle.Success);
        
        const cancelButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${this.data.button.Cancel}`)
            .setLabel(this.data.button.Cancel)
            .setStyle(ButtonStyle.Danger);
        
        return new ActionRowBuilder()
            .addComponents(joinButton, leaveButton, startButton, cancelButton);
    },
    
    async handle(interaction) {
        const client = interaction.client;
        const message = interaction.message;
        const action = interaction.customId.split('.')[1];

        const battleRec  = await Battle.get({ messageId: message.id, unique: true });
        const trainerRec = await Trainer.get({id: interaction.user.id, unique: true});

        // Log some stuff for debugging
        client.logger.debug(`Handling Battle Action Button for Message ID = ${message.id}`);
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
            case this.data.button.Join: this.handleJoin(interaction, battleRec, trainerRec); break;
            case this.data.button.Leave: this.handleLeave(interaction, battleRec, trainerRec); break;
            case this.data.button.Start: this.handleStart(interaction, battleRec, trainerRec); break;
            case this.data.button.Cancel: this.handleCancel(interaction, battleRec, trainerRec); break;
        }
    },

    async handleJoin(interaction, battleRec, trainerRec) {
        const client = interaction.client;
        const hostTrainerRec = await Trainer.get({ id: battleRec.hostTrainerId, unique: true });
        
        // Check if the host is trying to join the raid
        //if (battleRec.hostTrainerId == trainerRec.id) {
        //    await interaction.reply({
        //        content: `You cannot join a raid that you are hosting`,
        //        flags: MessageFlags.Ephemeral
        //    });
        //    return;
        //}

        // Check if this trainer has already joined the raid
        let battleMemberObj = {
            battleId: battleRec.id,
            trainerId: trainerRec.id,
            unique: true
        };
        let battleMemberRec = await BattleMember.get(battleMemberObj);

        if (battleMemberRec) {
            await interaction.reply({
                content: `You have already joined this raid`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Join the trainer to this raid
        battleMemberRec = new BattleMember(battleMemberObj);
        await battleMemberRec.create();

        hostTrainerRec.formattedCode

        await interaction.reply({
            content: `You have joined this raid, please make sure to add the host to your friends list`,
            flags: MessageFlags.Ephemeral
        });

        await interaction.followUp({
            content: `${hostTrainerRec.formattedCode} -- ${hostTrainerRec.name}`,
            flags: MessageFlags.Ephemeral
        });

        // Debug some stuff
        client.logger.debug(`Interaction Message =`);
        client.logger.dump(interaction.message);

        // Update the embed (noting we have to make sure the channel is in the cache first)
        const battleEmbed = await battleRec.buildEmbed();
        await client.channels.fetch(interaction.message.channelId);
        await interaction.message.edit({
            embeds: [battleEmbed]
        });
    },

    async handleLeave(interaction, battleRec, trainerRec) {
        const client = interaction.client;

        // Check if the host is trying to leave the raid
        //if (battleRec.hostTrainerId == trainerRec.id) {
        //    await interaction.reply({
        //        content: `You cannot leave a raid that you are hosting, please click ${this.data.button.Cancel} to cancel this raid`,
        //        flags: MessageFlags.Ephemeral
        //    });
        //    return;
        //}

        // Check if this trainer has not yet joined the raid
        let battleMemberObj = {
            battleId: battleRec.id,
            trainerId: trainerRec.id,
            unique: true
        };
        let battleMemberRec = await BattleMember.get(battleMemberObj);

        if (!battleMemberRec) {
            await interaction.reply({
                content: `You have not yet joined this raid`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Remove the trainer from this raid
        await battleMemberRec.delete();

        await interaction.reply({
            content: `You have left this raid`,
            flags: MessageFlags.Ephemeral
        });

        // Debug some stuff
        client.logger.debug(`Interaction Message =`);
        client.logger.dump(interaction.message);

        // Update the embed (noting we have to make sure the channel is in the cache first)
        const battleEmbed = await battleRec.buildEmbed();
        await client.channels.fetch(interaction.message.channelId);
        await interaction.message.edit({
            embeds: [battleEmbed]
        });
    },

    async handleStart(interaction, battleRec, trainerRec) {
        const client = interaction.client;

        //await interaction.reply({
        //    content: `Battle Action Button Not Processed Yet - ${this.data.button.Start}`,
        //    flags: MessageFlags.Ephemeral
        //});

        // Update the embed (noting we have to make sure the channel is in the cache first)
        const battleEmbed = await battleRec.buildEmbed();
        await client.channels.fetch(interaction.message.channelId);
        await interaction.message.edit({
            embeds: [battleEmbed]
        });
        
    },

    async handleCancel(interaction, battleRec, trainerRec) {
        const client = interaction.client;

        await interaction.reply({
            content: `Battle Action Button Not Processed Yet - ${this.data.button.Cancel}`,
            flags: MessageFlags.Ephemeral
        });
    }
};

export default BattleActionButtons;
