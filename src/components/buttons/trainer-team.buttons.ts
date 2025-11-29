import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageFlags,
    ModalSubmitInteraction,
} from 'discord.js';

import { MessageType, Team } from '@/constants.js';
import { ComponentIndex } from '@/types/component-index';
import type { ButtonsComponent } from '@/types/component';

import { TrainerService } from '@/services/trainer.service';

import { emoji } from '@/utils/emoji';

const TrainerTeamButton = {
    Instinct: Team.Instinct,
    Mystic: Team.Mystic,
    Valor: Team.Valor,
    Delete: 'Delete Team',
    Cancel: 'Cancel',
};

export class TrainerTeamButtons implements ButtonsComponent {
    name = 'TrainerTeamButtons';
    id = 'button';

    async show(
        interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
        _messageType = MessageType.Reply
    ) {
        // const client = interaction.client as Client;
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
            .setEmoji(emoji.team.instinct);

        buttonIndex.id = TrainerTeamButton.Mystic;
        const mysticButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(TrainerTeamButton.Mystic)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.team.mystic);

        buttonIndex.id = TrainerTeamButton.Valor;
        const valorButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(TrainerTeamButton.Valor)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.team.valor);

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

        await (interaction.replied
            ? interaction.followUp({
                  content: 'Please select your team',
                  components: [teamRow],
                  flags: MessageFlags.Ephemeral,
              })
            : interaction.reply({
                  content: 'Please select your team',
                  components: [teamRow],
                  flags: MessageFlags.Ephemeral,
              }));
    }

    async handleButton(interaction: ButtonInteraction) {
        // const client = interaction.client as Client;
        // const trainerSearchObj: TrainerConditions = { discordId: interaction.user.id };
        const buttonIndex = ComponentIndex.parse(interaction.customId);
        const action = buttonIndex.id;

        if (action == TrainerTeamButton.Cancel) {
            await interaction.update({
                content: 'Team selection cancelled',
                components: [],
            });
            return;
        }

        if (action == TrainerTeamButton.Delete) {
            await TrainerService.deleteTeam(interaction.user.id);

            await interaction.update({
                content: 'Team deleted',
                components: [],
            });
            return;
        }

        const team = action;
        await TrainerService.updateTeam(interaction.user.id, team);

        let teamEmoji: string = '';

        switch (team) {
            case TrainerTeamButton.Instinct: {
                teamEmoji = emoji.team.instinct;
                break;
            }
            case TrainerTeamButton.Mystic: {
                teamEmoji = emoji.team.mystic;
                break;
            }
            case TrainerTeamButton.Valor: {
                teamEmoji = emoji.team.valor;
                break;
            }
        }

        await interaction.update({
            content: `Team set to ${team} <:customemoji:${teamEmoji}>`,
            components: [],
        });
    }
}

export const component = new TrainerTeamButtons();
