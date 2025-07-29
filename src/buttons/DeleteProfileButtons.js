
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags
} from 'discord.js';

import {
    MessageType,
    Team
} from '#src/Constants.js';

import Trainer from '#src/data/Trainer.js';

const Confirm = 'Confirm';
const Cancel = 'Cancel';

const DeleteProfileButtons = {
    data: {
        name: 'DeleteProfile'
    },

    async show(interaction, messageType = MessageType.Reply) {
        const client = interaction.client;
        
        // Create the buttons
        const confirmButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${Confirm}`)
            .setLabel(Confirm)
            .setStyle(ButtonStyle.Danger);
        
        const cancelButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${Cancel}`)
            .setLabel(Cancel)
            .setStyle(ButtonStyle.Secondary);
        
        const buttonRow = new ActionRowBuilder()
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
    
    async handle(interaction) {
        const client = interaction.client;
        const trainer = await Trainer.get({id: interaction.user.id, unique: true});
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
