import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageFlags,
    ModalSubmitInteraction,
} from 'discord.js';

import { MessageType } from '@/constants.js';
import { ComponentIndex } from '@/types/component-index';
import type { ButtonsComponent } from '@/types/component';

import { trainerRepository } from '@/database/repositories.js';

import { emoji } from '@/utils/emoji';

const DeleteProfileButton = {
    Confirm: 'Confirm',
    Cancel: 'Cancel',
};

export class DeleteProfileButtons implements ButtonsComponent {
    name = 'DeleteProfileButtons';
    id = 'button';
    description = 'Delete profile confirmation buttons';

    async show(
        interaction: ChatInputCommandInteraction | ModalSubmitInteraction,
        messageType = MessageType.Reply
    ) {
        const trainer = await trainerRepository.findOneBy({ discordId: interaction.user.id });
        if (!trainer) {
            await interaction.reply({
                content: 'You have not setup your trainer profile',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const buttonIndex = new ComponentIndex({
            name: this.name,
            id: this.id,
        });

        // Create the buttons
        buttonIndex.id = DeleteProfileButton.Confirm;
        const confirmButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(DeleteProfileButton.Confirm)
            .setStyle(ButtonStyle.Danger)
            .setEmoji(emoji.delete);

        buttonIndex.id = DeleteProfileButton.Cancel;
        const cancelButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(DeleteProfileButton.Cancel)
            .setStyle(ButtonStyle.Secondary)
            .setEmoji(emoji.cancel);

        const buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            confirmButton,
            cancelButton
        );

        if (messageType === MessageType.Reply) {
            await interaction.reply({
                content: 'Are you sure you want to delete your profile?',
                components: [buttonRow],
                flags: MessageFlags.Ephemeral,
            });
        } else if (messageType === MessageType.FollowUp) {
            await interaction.followUp({
                content: 'Are you sure you want to delete your profile?',
                components: [buttonRow],
                flags: MessageFlags.Ephemeral,
            });
        }
    }

    async handleButton(interaction: ButtonInteraction) {
        const buttonIndex = ComponentIndex.parse(interaction.customId);
        const action = buttonIndex.id;

        const trainer = await trainerRepository.findOneBy({ discordId: interaction.user.id });

        if (action === DeleteProfileButton.Cancel) {
            await interaction.update({
                content: 'Profile deletion cancelled',
                components: [],
            });
            return;
        }

        if (action === DeleteProfileButton.Confirm) {
            if (!trainer) {
                await interaction.update({
                    content: 'Trainer profile not found',
                    components: [],
                });
                return;
            }

            await trainerRepository.remove(trainer);
            await interaction.update({
                content: 'Your trainer profile has been deleted',
                components: [],
            });
            return;
        }
    }
}

export const component = new DeleteProfileButtons();
