import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageFlags,
} from 'discord.js';

import { MessageType } from '@root/src/constants.js';

import Client from '@root/src/client.js';
import ComponentIndex from '@/types/ComponentIndex.js';
import Trainer from '@/models/Trainer.js';

const DeleteProfileButton = {
    Confirm: 'Confirm',
    Cancel: 'Cancel',
};

const DeleteProfileButtons = {
    name: 'DeleteProfileButtons',

    async show(interaction: ChatInputCommandInteraction, messageType = MessageType.Reply) {
        const client = interaction.client as Client;
        const emoji = client.config.emoji;

        const trainer = await Trainer.getUnique({ discordId: interaction.user.id });
        if (!trainer) {
            await interaction.reply({
                content: 'You have not setup your trainer profile',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const buttonIndex = new ComponentIndex({
            name: this.name,
            id: 'button',
        });

        // Create the buttons
        buttonIndex.id = DeleteProfileButton.Confirm;
        const confirmButton = new ButtonBuilder()
            .setCustomId(buttonIndex.toString())
            .setLabel(DeleteProfileButton.Confirm)
            .setStyle(ButtonStyle.Secondary)
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

        if (messageType == MessageType.Reply) {
            await interaction.reply({
                content: 'Are you sure you want to delete your profile?',
                components: [buttonRow],
                flags: MessageFlags.Ephemeral,
            });
        } else if (messageType == MessageType.FollowUp) {
            await interaction.followUp({
                content: 'Are you sure you want to delete your profile?',
                components: [buttonRow],
                flags: MessageFlags.Ephemeral,
            });
        }
    },

    async handleButton(interaction: ButtonInteraction) {
        const trainer = await Trainer.getUnique({ discordId: interaction.user.id });
        const buttonIndex = ComponentIndex.parse(interaction.customId);
        const action = buttonIndex.id;

        if (action == DeleteProfileButton.Cancel) {
            await interaction.reply({
                content: 'Profile deletion cancelled',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        if (action == DeleteProfileButton.Confirm) {
            if (!trainer) {
                await interaction.reply({
                    content: 'Trainer profile not found',
                    flags: MessageFlags.Ephemeral,
                });
                return;
            }

            await trainer.delete();
            await interaction.reply({
                content: 'Your trainer profile has been deleted',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
    },
};

export default DeleteProfileButtons;
