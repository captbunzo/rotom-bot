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

const Confirm = 'Confirm';
const Cancel = 'Cancel';

const DeleteProfileButtons = {
    data: {
        name: 'DeleteProfile'
    },

    async show(interaction: ChatInputCommandInteraction, messageType = MessageType.Reply) {        
        // Create the buttons
        const confirmButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${Confirm}`)
            .setLabel(Confirm)
            .setStyle(ButtonStyle.Danger);
        
        const cancelButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${Cancel}`)
            .setLabel(Cancel)
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

    async handle(interaction: ButtonInteraction) {
        const trainer = await Trainer.getUnique({ discordId: interaction.user.id });
        const action = interaction.customId.split('.')[1];

        if (action == Cancel) {
            await interaction.reply({
                content: 'Profile deletion cancelled',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (action == Confirm) {
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