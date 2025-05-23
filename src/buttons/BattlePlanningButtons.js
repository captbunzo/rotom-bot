
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
import Boss         from '../data/Boss.js';
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

        const battle  = await Battle.get({ messageId: message.id, unique: true });
        const trainer = await Trainer.get({ id: interaction.user.id, unique: true });

        // Log some stuff for debugging
        client.logger.debug(`Handling Battle Planning Button for Message ID = ${message.id}`);
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
            case this.data.button.Join: this.handleJoin(interaction, battle, trainer); break;
            case this.data.button.Leave: this.handleLeave(interaction, battle, trainer); break;
            case this.data.button.Start: this.handleStart(interaction, battle, trainer); break;
            case this.data.button.Cancel: this.handleCancel(interaction, battle, trainer); break;
        }
    },

    async handleJoin(interaction, battle, trainer) {
        const client = interaction.client;
        const hostTrainer = await Trainer.get({ id: battle.hostTrainerId, unique: true });
        const boss = await Boss.get({ id: battle.bossId, unique: true });
        const battleTypeName = boss.battleTypeName;
        
        // Check if the host is trying to join the raid
        if ( client.config.options.blockBattleHostSelfJoin && (battle.battlehostTrainerId == trainer.id) ) {
            await interaction.reply({
                content: `You cannot join a ${battleTypeName.toLowerCase()} that you are hosting`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Check if this trainer has already joined the battle
        const battleMemberObj = {
            battleId: battle.id,
            trainerId: trainer.id,
            unique: true
        };

        let battleMember = await BattleMember.get(battleMemberObj);
        if (battleMember) {
            await interaction.reply({
                content: `You have already joined this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Join the trainer to this battle
        battleMemberObj.status = BattleMemberStatus.Joined;
        battleMember = new BattleMember(battleMemberObj);
        await battleMember.create();

        // Update the embed
        const battleEmbed = await battle.buildEmbed();
        await interaction.update({
            embeds: [battleEmbed]
        });

        await interaction.followUp({
            content:
                  `You have joined this ${battleTypeName.toLowerCase()}, please make sure to add the host to your friends list with the following trainer code. `
                + `Note that Pokémon Go will ignore the text after the numbers.`,
            flags: MessageFlags.Ephemeral
        });

        await interaction.followUp({
            content: `${hostTrainer.formattedCode} -- ${hostTrainer.name}`,
            flags: MessageFlags.Ephemeral
        });

        // Debug some stuff
        client.logger.debug(`Interaction Message =`);
        client.logger.dump(interaction.message);
    },

    async handleLeave(interaction, battle, trainer) {
        const client = interaction.client;
        const boss = await Boss.get({ id: battle.bossId, unique: true });
        const battleTypeName = boss.battleTypeName;

        // Check if the host is trying to leave the raid
        if ( client.config.options.blockBattleHostSelfJoin && (battle.hostTrainerId == trainer.id) ) {
            await interaction.reply({
                content:
                    `You cannot leave a ${battleTypeName.toLowerCase()} that you are hosting, `
                  + `please click ${this.data.button.Cancel} to cancel this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Check if this trainer has not yet joined the raid
        const battleMemberObj = {
            battleId: battle.id,
            trainerId: trainer.id,
            unique: true
        };

        const battleMember = await BattleMember.get(battleMemberObj);
        if (!battleMember) {
            await interaction.reply({
                content: `You have not yet joined this ${battleTypeName.toLowerCase()}`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Remove the trainer from this raid
        await battleMember.delete();

        //await client.channels.fetch(interaction.message.channelId);
        
        // Update the embed (noting we have to make sure the channel is in the cache first)
        const battleEmbed = await battle.buildEmbed();
        await interaction.update({
            embeds: [battleEmbed]
        });

        await interaction.followUp({
            content: `You have left this ${battleTypeName.toLowerCase()}`,
            flags: MessageFlags.Ephemeral
        });

        // Debug some stuff
        client.logger.debug(`Interaction Message =`);
        client.logger.dump(interaction.message);
    },

    async handleStart(interaction, battle, trainer) {
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

        // Collect the battle members
        const battleMembers = await BattleMember.get({ battleId: battle.id });

        if (battleMembers.length == 0) {
            await interaction.reply({
                content: `You must have at least one battle member to start the ${battleTypeName.toLowerCase()}, perhaps cancel instead?`,
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        // Update the battle status
        battle.status = BattleStatus.Started;
        await battle.update();

        // Update the battle message
        const battleEmbed = await battle.buildEmbed();
		const battleStartedButtons = await BattleStartedButtons.build(interaction);

        await interaction.update({
            embeds: [battleEmbed],
            components: [battleStartedButtons]
        });

        // Get battle member details together
        const battleMemberTrainerNames = [];
        const battleMemberDiscordPings = [];

        for (const battleMember of battleMembers ) {
            let battleMemberTrainer = await Trainer.get({ id: battleMember.trainerId, unique: true });
            battleMemberTrainerNames.push(battleMemberTrainer.name);
            battleMemberDiscordPings.push(`<@${battleMemberTrainer.id}>`);
        }
        const battleMemberTrainerList = battleMemberTrainerNames.join(',');
        const battleMemberDiscordPingList = battleMemberDiscordPings.join(', ');

        // Ping the battle members
        await interaction.followUp({
            content: `${battleMemberDiscordPingList} -- ${battleTypeName} started, please look for a invite from ${trainer.name}`
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
        
        // Delete the battle members
        //const battleMembers = await BattleMember.get({ battleId: battle.id });
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
            components: []
        });

        // Ping the battle members
        const battleMembers = await BattleMember.get({ battleId: battle.id });

        if (battleMembers.length > 0) {
            const battleMemberDiscordPings = [];

            for (const battleMember of battleMembers ) {
                let battleMemberTrainer = await Trainer.get({ id: battleMember.trainerId, unique: true });
                battleMemberDiscordPings.push(`<@${battleMemberTrainer.id}>`);
            }
            const battleMemberDiscordPingList = battleMemberDiscordPings.join(', ');

            await interaction.followUp({
                content: `${battleMemberDiscordPingList} -- ${battleTypeName} cancelled`
            });
        }
    }
};

export default BattlePlanningButtons;
