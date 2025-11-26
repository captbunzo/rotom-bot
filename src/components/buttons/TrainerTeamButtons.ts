import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageFlags,
    ModalSubmitInteraction,
} from 'discord.js';

import { MessageType, Team } from '@root/src/constants.js';

import Client from '@root/src/client.js';

import type { TrainerConditions } from '@/types/ModelTypes.js';
import ComponentIndex from '@/types/ComponentIndex.js';
import Trainer from '@/models/Trainer.js';

const TrainerTeamButton = {
    Instinct: Team.Instinct,
    Mystic: Team.Mystic,
    Valor: Team.Valor,
    Delete: 'Delete Team',
    Cancel: 'Cancel',
};

const TrainerTeamButtons = {
    name: 'TrainerTeamButtons',

    async show(
        interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
        _messageType = MessageType.Reply
    ) {
        const client = interaction.client as Client;
        const emoji = client.config.emoji;

        const buttonIndex = new ComponentIndex({
            name: this.name,
            id: 'button',
        });

        // Create the buttons
        buttonIndex.id = TrainerTeamButton.Instinct;
        const instinctButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(TrainerTeamButton.Instinct)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.instinct);

        buttonIndex.id = TrainerTeamButton.Mystic;
        const mysticButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(TrainerTeamButton.Mystic)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.mystic);

        buttonIndex.id = TrainerTeamButton.Valor;
        const valorButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(TrainerTeamButton.Valor)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.valor);

        buttonIndex.id = TrainerTeamButton.Delete;
        const deleteButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(TrainerTeamButton.Delete)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.delete);

        buttonIndex.id = TrainerTeamButton.Cancel;
        const cancelButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(TrainerTeamButton.Cancel)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.cancel);

        const teamRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            instinctButton,
            mysticButton,
            valorButton,
            deleteButton,
            cancelButton
        );

        if (!interaction.replied) {
            await interaction.reply({
                content: 'Please select your team',
                components: [teamRow],
                flags: MessageFlags.Ephemeral,
            });
        } else {
            await interaction.followUp({
                content: 'Please select your team',
                components: [teamRow],
                flags: MessageFlags.Ephemeral,
            });
        }
    },

    async handleButton(interaction: ButtonInteraction) {
        const client = interaction.client as Client;
        const trainerSearchObj: TrainerConditions = { discordId: interaction.user.id };
        const buttonIndex = ComponentIndex.parse(interaction.customId);
        const action = buttonIndex.id;

        if (action == TrainerTeamButton.Cancel) {
            return await interaction.update({
                content: 'Team selection cancelled',
                components: [],
            });
        }

        let trainer = await Trainer.getUnique(trainerSearchObj);
        if (!trainer) {
            trainer = new Trainer({
                discordId: interaction.user.id,
            });
            await trainer.create();
        }

        if (action == TrainerTeamButton.Delete) {
            trainer.team = null;
            await trainer.update();

            return await interaction.update({
                content: 'Team deleted',
                components: [],
            });
        }

        const team = action;
        trainer.team = team;
        await trainer.update();

        let teamEmoji: string = '';

        switch (team) {
            case TrainerTeamButton.Instinct:
                teamEmoji = client.config.emoji.instinct;
                break;
            case TrainerTeamButton.Mystic:
                teamEmoji = client.config.emoji.mystic;
                break;
            case TrainerTeamButton.Valor:
                teamEmoji = client.config.emoji.valor;
                break;
        }

        return await interaction.update({
            content: `Team set to ${team} <:customemoji:${teamEmoji}>`,
            components: [],
        });
    },
};

export default TrainerTeamButtons;
