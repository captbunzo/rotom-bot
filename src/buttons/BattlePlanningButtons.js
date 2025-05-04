
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

import BattleStartedButtons from './BattleStartedButtons.js';

const BattlePlanningButtons = {
    data: {
        name: 'BattlePlanningButtons',
        description: 'Battle planning buttons',
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
        client.logger.debug(`Handling Battle Planning Button for Message ID = ${message.id}`);
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
        if ( client.config.options.blockBattleHostSelfJoin && (battleRec.hostTrainerId == trainerRec.id) ) {
            await interaction.reply({
                content: `You cannot join a raid that you are hosting`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

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
        battleMemberObj.status = BattleMemberStatus.Joined;
        battleMemberRec = new BattleMember(battleMemberObj);
        await battleMemberRec.create();

        hostTrainerRec.formattedCode

        //await client.channels.fetch(interaction.message.channelId);

        // Update the embed (noting we have to make sure the channel is in the cache first)
        const battleEmbed = await battleRec.buildEmbed();
        await interaction.update({
            embeds: [battleEmbed]
        });

        await interaction.followUp({
            content:
                  'You have joined this raid, please make sure to add the host to your friends list with the following trainer code. '
                + 'Note that Pokémon Go will ignore the text after the numbers.',
            flags: MessageFlags.Ephemeral
        });

        await interaction.followUp({
            content: `${hostTrainerRec.formattedCode} -- ${hostTrainerRec.name}`,
            flags: MessageFlags.Ephemeral
        });

        // Debug some stuff
        client.logger.debug(`Interaction Message =`);
        client.logger.dump(interaction.message);
    },

    async handleLeave(interaction, battleRec, trainerRec) {
        const client = interaction.client;

        // Check if the host is trying to leave the raid
        if ( client.config.options.blockBattleHostSelfJoin && (battleRec.hostTrainerId == trainerRec.id) ) {
            await interaction.reply({
                content: `You cannot leave a raid that you are hosting, please click ${this.data.button.Cancel} to cancel this raid`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

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

        //await client.channels.fetch(interaction.message.channelId);
        
        // Update the embed (noting we have to make sure the channel is in the cache first)
        const battleEmbed = await battleRec.buildEmbed();
        await interaction.update({
            embeds: [battleEmbed]
        });

        await interaction.followUp({
            content: `You have left this raid`,
            flags: MessageFlags.Ephemeral
        });

        // Debug some stuff
        client.logger.debug(`Interaction Message =`);
        client.logger.dump(interaction.message);
    },

    async handleStart(interaction, battleRec, trainerRec) {
        const client = interaction.client;

        // Only the host can cancel the raid
        if (battleRec.hostTrainerId != trainerRec.id) {
            await interaction.reply({
                content: `Only the host can cancel this raid`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Collect the battle members
        const battleMemberRecs = await BattleMember.get({ battleId: battleRec.id });

        if (battleMemberRecs.length == 0) {
            await interaction.reply({
                content: `You must have at least one battle member to start the battle, perhaps cancel instead?`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Update the battle status
        battleRec.status = BattleStatus.Started;
        await battleRec.update();

        // Update the battle message
        const battleEmbed = await battleRec.buildEmbed();
		const battleStartedButtons = await BattleStartedButtons.build(interaction);

        await interaction.update({
            embeds: [battleEmbed],
            components: [battleStartedButtons]
        });

        // Get battle member details together
        let battleMemberTrainerNames = [];
        let battleMemberDiscordPings = [];

        for (const battleMemberRec of battleMemberRecs ) {
            let trainerRec = await Trainer.get({ id: battleMemberRec.trainerId, unique: true });
            battleMemberTrainerNames.push(trainerRec.name);
            battleMemberDiscordPings.push(`<@${trainerRec.id}>`);
        }
        let battleMemberTrainerList = battleMemberTrainerNames.join(',');
        let battleMemberDiscordPingList = battleMemberDiscordPings.join(', ');

        // Ping the battle members
        await interaction.followUp({
            content: `${battleMemberDiscordPingList} -- Raid started, please look for a invite from ${trainerRec.name}`
        });

        // Message the host with the battle member trainer names
        await interaction.followUp({
            content: `Please use the following text to invite battle members`,
            flags: MessageFlags.Ephemeral
        });        

        await interaction.followUp({
            content: battleMemberTrainerList,
            flags: MessageFlags.Ephemeral
        });
    },

    async handleCancel(interaction, battleRec, trainerRec) {
        const client = interaction.client;

        // Only the host can cancel the raid
        if (battleRec.hostTrainerId != trainerRec.id) {
            await interaction.reply({
                content: `Only the host can cancel this raid`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }
        
        // Delete the battle members
        //const battleMemberRecs = await BattleMember.get({ battleId: battleRec.id });
        //for (const battleMemberRec of battleMemberRecs ) {
        //    await battleMemberRec.delete();
        //}

        // Update the battle record
        battleRec.status = BattleStatus.Cancelled;
        await battleRec.update();

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

export default BattlePlanningButtons;
