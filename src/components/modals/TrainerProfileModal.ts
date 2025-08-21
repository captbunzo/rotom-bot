import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    MessageFlags,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle
} from 'discord.js';

import {
    type TrainerData,
    Trainer
} from '#src/models/Trainer.js';

import TrainerTeamButtons from '#src/components/buttons/TrainerTeamButtons.js';

const TrainerProfileModal = {
    name: 'TrainerProfileModal',

    async show(interaction: ChatInputCommandInteraction) {
        const trainer = await Trainer.getUnique({ discordId: interaction.user.id });

        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId(this.name)
            .setTitle('Trainer Profile');

        // Create the text input components -- name, code, level, team
        const trainerNameInput = new TextInputBuilder()
            .setCustomId('trainerName')
            .setLabel('Trainer Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);
        
        const firstNameInput = new TextInputBuilder()
            .setCustomId('firstName')
            .setLabel('First Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
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
        
        const favoritePokemonInput = new TextInputBuilder()
            .setCustomId('favoritePokemon')
            .setLabel('Favorite Pokémon (optional)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        if (trainer) {
            trainerNameInput.setValue(trainer.trainerName);

            if (trainer.firstName) {
                firstNameInput.setValue(trainer.firstName);
            }

            if (trainer.code) {
                codeInput.setValue(trainer.code);
            }

            if (trainer.level) {
                levelInput.setValue(trainer.level.toString());
            }

            if (trainer.favoritePokemon) {
                favoritePokemonInput.setValue(trainer.favoritePokemon);
            }
        }

        modal.addComponents(
            new ActionRowBuilder<TextInputBuilder>().addComponents(trainerNameInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(firstNameInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(codeInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(levelInput),
            new ActionRowBuilder<TextInputBuilder>().addComponents(favoritePokemonInput)
        );

        // Finally show the modal
        interaction.showModal(modal);
    },
    
    async handleModalSubmit(interaction: ModalSubmitInteraction) {
        let trainer = await Trainer.getUnique({ discordId: interaction.user.id });
        
        //client.logger.log(`Interaction User ID = ${interaction.user.id}`);
        //client.logger.log(`Trainer = ${trainer}`);
        //client.logger.log(`Trainer Name = ${trainer.trainerName}`);
        //client.logger.log(`Trainer First Name = ${trainer.firstName}`);
        //client.logger.log(`Trainer Code = ${trainer.code}`);
        //client.logger.log(`Trainer Level = ${trainer.level}`);
        //client.logger.log(`Trainer Team = ${trainer.team}`);
        //client.logger.log(`Trainer Favorite Pokemon = ${trainer.favoritePokemon}`);

        const trainerName     = interaction.fields.getTextInputValue('trainerName');
        const firstName       = interaction.fields.getTextInputValue('firstName');
        const code            = interaction.fields.getTextInputValue('code');
        const level           = parseInt(interaction.fields.getTextInputValue('level'));
        const favoritePokemon = interaction.fields.getTextInputValue('favoritePokemon');

        //if (code.length == 0) code = null;
        //if (level.length == 0) level = null;

        if (!trainer) {
            const trainerData: TrainerData = {
                discordId: interaction.user.id,
                trainerName: trainerName,
                firstName: firstName,
                code: code,
                level: level,
                favoritePokemon: favoritePokemon
            };
            trainer = new Trainer(trainerData);
            await trainer.create();
        } else {
            trainer.trainerName = trainerName;
            trainer.firstName = firstName;
            trainer.code = code;
            trainer.level = level;
            trainer.favoritePokemon = favoritePokemon;
            await trainer.update();
        }

        await interaction.reply({
            content: `Trainer profile updated`,
            flags: MessageFlags.Ephemeral
        });

        // Prompt the user to set their team if not already set
        if (!trainer.team) {
            await TrainerTeamButtons.show(interaction);
        }
    }
};

export default TrainerProfileModal;