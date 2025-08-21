import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageFlags
} from 'discord.js';

import {
    MessageType
} from '#src/Constants.js';

import Trainer from '#src/models/Trainer.js';

const DeleteProfileButtons = {
    name: 'DeleteProfileButtons',
    button: {
        confirm: 'Confirm',
        cancel: 'Cancel'
    },

    async show(interaction: ChatInputCommandInteraction, messageType = MessageType.Reply) {        
        // Create the buttons
        const confirmButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${this.button.confirm}`)
            .setLabel(this.button.confirm)
            .setStyle(ButtonStyle.Danger);
        
        const cancelButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${this.button.cancel}`)
            .setLabel(this.button.cancel)
            .setStyle(ButtonStyle.Secondary);
        
        const buttonRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(confirmButton, cancelButton);

            if (messageType == MessageType.Reply) {
                await interaction.reply({
                    content: 'Are you sure you want to delete your profile?',
                    components: [buttonRow],
                    flags: MessageFlags.Ephemeral
                });
            } else if (messageType == MessageType.FollowUp) {
                await interaction.followUp({
                    content: 'Are you sure you want to delete your profile?',
                    components: [buttonRow],
                    flags: MessageFlags.Ephemeral
                });
            }
    },

    async handleButton(interaction: ButtonInteraction) {
        const trainer = await Trainer.getUnique({ discordId: interaction.user.id });
        const action = interaction.customId.split('.')[1];

        if (action == this.button.cancel) {
            await interaction.reply({
                content: 'Profile deletion cancelled',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (action == this.button.confirm) {
            if (!trainer) {
                await interaction.reply({
                    content: 'Trainer profile not found',
                    flags: MessageFlags.Ephemeral
                });
                return;
            }

            await trainer.delete();
            await interaction.reply({
                content: 'Your trainer profile has been deleted',
                flags: MessageFlags.Ephemeral
            });
            return;
        }
    }
};

export default DeleteProfileButtons;