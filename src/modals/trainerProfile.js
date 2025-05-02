
import {
    ActionRowBuilder,
    MessageFlags,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';

import Trainer from '../data/Trainer.js';

const trainerProfile = {
    data: {
        name: 'trainerProfile'
    },

    async show(interaction) {
        const client = interaction.client;
        const trainer = await Trainer.get({id: interaction.user.id, unique: true});

        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId(this.data.name)
            .setTitle('Trainer Profile');

        // Create the text input components -- name, code, level, team
        const nameInput = new TextInputBuilder()
            .setCustomId('name')
            .setLabel('Trainer Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        
        const codeInput = new TextInputBuilder()
            .setCustomId('code')
            .setLabel('Trainer Code')
            .setStyle(TextInputStyle.Short)
            .setMinLength(12)
            .setMaxLength(12)
            .setRequired(false);
        
        const levelInput = new TextInputBuilder()
            .setCustomId('level')
            .setLabel('Trainer Level')
            .setStyle(TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(2)
            .setRequired(false);
        
        if (trainer) {
            nameInput.setValue(trainer.name);

            if (trainer.code) {
                codeInput.setValue(trainer.code);
            }

            if (trainer.level) {
                levelInput.setValue(trainer.level.toString());
            }
        }

        // Create rows and add them to the modal
        const nameRow = new ActionRowBuilder().addComponents(nameInput);
        const codeRow = new ActionRowBuilder().addComponents(codeInput);
        const levelRow = new ActionRowBuilder().addComponents(levelInput);
        modal.addComponents(nameRow, codeRow, levelRow);

        await interaction.showModal(modal);
    },
    
    async handle(interaction) {
        const client = interaction.client;
        var trainer = await Trainer.get({id: interaction.user.id, unique: true});
        
        //client.logger.log(`Interaction User ID = ${interaction.user.id}`);
        //client.logger.log(`Trainer = ${trainer}`);
        //client.logger.log(`Trainer Name = ${trainer.name}`);
        //client.logger.log(`Trainer Code = ${trainer.code}`);
        //client.logger.log(`Trainer Level = ${trainer.level}`);
        //client.logger.log(`Trainer Team = ${trainer.team}`);
        //client.logger.log(trainer.name);

        var name = interaction.fields.getTextInputValue('name');
        var code = interaction.fields.getTextInputValue('code');
        var level = interaction.fields.getTextInputValue('level');

        //if (code.length == 0) code = null;
        //if (level.length == 0) level = null;

        if (!trainer) {
            trainer = new Trainer({
                id: interaction.user.id,
                name: name,
                code: code,
                level: level
            });
            await trainer.create();
        } else {
            trainer.name = name;
            trainer.code = code;
            trainer.level = level;
            await trainer.update();
        }

        await interaction.reply({ content: `Profile -- Trainer profile management not yet implemented`, flags: MessageFlags.Ephemeral });
    }
};

export default trainerProfile;
