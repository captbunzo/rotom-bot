
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

const ClearTeam = 'Clear Team';
const Cancel = 'Cancel';

const TrainerTeamButtons = {
    data: {
        name: 'TrainerTeam'
    },

    async show(interaction, messageType = MessageType.Reply) {
        const client = interaction.client;
        
        // TODO - Add team emoji to rotom discord and figure out how to use them in these buttons cause that would be awesome
        // const teamEmoji = client.emojis.cache.get(Team.Instinct.emojiId

        // Create the buttons
        const instinctButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${Team.Instinct}`)
            .setLabel(Team.Instinct)
            .setStyle(ButtonStyle.Primary)
            //.setEmoji(client.emojis.cache.get(Team.Instinct.emojiId));
        
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
        
        const cancelButton = new ButtonBuilder()
            .setCustomId(`${this.data.name}.${Cancel}`)
            .setLabel(Cancel)
            .setStyle(ButtonStyle.Secondary);
        
        const teamRow = new ActionRowBuilder()
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
    
    async handle(interaction) {
        const client = interaction.client;
        const trainer = await Trainer.get({id: interaction.user.id, unique: true});
        const team = interaction.customId.split('.')[1];

        if (team == Cancel) {
            await interaction.reply({
                content: 'Team selection cancelled',
                flags: MessageFlags.Ephemeral
            });
            return;
        }
        
        trainer.team = ( team == ClearTeam ? null : team );
        await trainer.update();

        const message = ( team == ClearTeam
            ? `Trainer team cleared`
            : `Trainer team set to ${team}`
        );
        await interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
    }
};

export default TrainerTeamButtons;
