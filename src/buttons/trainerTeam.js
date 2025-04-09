
import { ButtonBuilder, ButtonStyle, ModalBuilder } from 'discord.js';
import { TextInputBuilder, TextInputStyle } from 'discord.js';
import { ActionRowBuilder } from 'discord.js';
import { MessageFlags } from 'discord.js';

import Trainer from '../data/Trainer.js';
import { Team } from '../Constants.js';

const ClearTeam = 'Clear Team';

const trainerTeam = {
    data: {
        name: 'trainerTeam'
    },

    async show(interaction) {
        const client = interaction.client;
        const trainer = await Trainer.get({id: interaction.user.id, unique: true});

        // Create the buttons
        const instinctButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${Team.Instinct}`)
            .setLabel(Team.Instinct)
            .setStyle(ButtonStyle.Primary);
        
        const mysticButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${Team.Mystic}`)
            .setLabel(Team.Mystic)
            .setStyle(ButtonStyle.Primary);

        const valorButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${Team.Valor}`)
            .setLabel(Team.Valor)
            .setStyle(ButtonStyle.Primary);
        
        const clearButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${ClearTeam}`)
            .setLabel(ClearTeam)
            .setStyle(ButtonStyle.Danger);
        
        const teamRow = new ActionRowBuilder()
            .addComponents(instinctButton, mysticButton, valorButton, clearButton);
        
            await interaction.reply({
                content: 'Please select your team',
                components: [teamRow]
            });
    },
    
    async handle(interaction) {
        const client = interaction.client;
        const trainer = await Trainer.get({id: interaction.user.id, unique: true});
        const team = interaction.customId.split('.')[1];

        trainer.team = ( team == ClearTeam ? null : team );
        await trainer.update();

        const message = ( team == ClearTeam
            ? `Trainer team cleared`
            : `Trainer team set to ${team}`
        );
        await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
    }
};

export default trainerTeam;
