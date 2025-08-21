import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    MessageFlags,
    ModalSubmitInteraction
} from 'discord.js';

import {
    MessageType,
    Team
} from '#src/Constants.js';

import type {
    TrainerConditions
} from '#src/types/ModelTypes.js';

import Trainer from '#src/models/Trainer.js';

const TrainerTeamButtons = {
    name: 'TrainerTeamButtons',
    button: {
        instinct: Team.Instinct,
        mystic: Team.Mystic,
        valor: Team.Valor,
        clear: 'Clear Team',
        cancel: 'Cancel'
    },

    async show(interaction: ChatInputCommandInteraction | ModalSubmitInteraction, _messageType = MessageType.Reply) {
        // TODO - Add team emoji to rotom discord and figure out how to use them in these buttons cause that would be awesome
        // const teamEmoji = client.emojis.cache.get(Team.Instinct.emojiId

        // Create the buttons
        const instinctButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${this.button.instinct}`)
            .setLabel(this.button.instinct)
            .setStyle(ButtonStyle.Primary)
            //.setEmoji(client.emojis.cache.get(Team.Instinct.emojiId));
        
        const mysticButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${this.button.mystic}`)
            .setLabel(this.button.mystic)
            .setStyle(ButtonStyle.Primary);

        const valorButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${this.button.valor}`)
            .setLabel(this.button.valor)
            .setStyle(ButtonStyle.Primary);
        
        const clearButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${this.button.clear}`)
            .setLabel(this.button.clear)
            .setStyle(ButtonStyle.Danger);
        
        const cancelButton = new ButtonBuilder()
            .setCustomId(`${this.name}.${this.button.cancel}`)
            .setLabel(this.button.cancel)
            .setStyle(ButtonStyle.Secondary);
        
        const teamRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(instinctButton, mysticButton, valorButton, clearButton, cancelButton);

        if (!interaction.replied) {
            await interaction.reply({
                content: 'Please select your team',
                components: [teamRow],
                flags: MessageFlags.Ephemeral
            });
        } else {
            await interaction.followUp({
                content: 'Please select your team',
                components: [teamRow],
                flags: MessageFlags.Ephemeral
            });
        }
    },

    async handleButton(interaction: ButtonInteraction) {
        const trainerSearchObj: TrainerConditions = { discordId: interaction.user.id };
        const trainer = await Trainer.getUnique(trainerSearchObj);
        const team = interaction.customId.split('.')[1];

        if (!trainer) {
            await interaction.reply({
                content: 'Trainer not found',
                flags: MessageFlags.Ephemeral
            });
            return;
        }

        if (team == this.button.cancel) {
            await interaction.reply({
                content: 'Team selection cancelled',
                flags: MessageFlags.Ephemeral
            });
            return;
        }
        
        if (!team) {
            throw new Error('Team not found');
        }

        trainer.team = ( team == this.button.clear ? null : team );
        await trainer.update();

        const message = ( team == this.button.clear
            ? `Trainer team cleared`
            : `Trainer team set to ${team}`
        );
        await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
    }
};

export default TrainerTeamButtons;