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

import ComponentIndex from '#src/types/ComponentIndex.js';
import TrainerTeamButtons from '#src/components/buttons/TrainerTeamButtons.js';

const TrainerProfileModal = {
    name: 'TrainerProfileModal',

    async show(interaction: ChatInputCommandInteraction) {
        const trainer = await Trainer.getUnique({ discordId: interaction.user.id });
        const componentIndex = new ComponentIndex({
            name: this.name,
            id: 'modal'
        });

        // Create the modal
        const modal = new ModalBuilder()
            .setCustomId(componentIndex.toString())
            .setTitle('Trainer Profile');

        // Create the text input components -- name, code, level, team
        const trainerNameInput = new TextInputBuilder()
            .setCustomId('trainerName')
            .setLabel('Trainer Name')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);
        
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
            if (trainer.trainerName) {
                trainerNameInput.setValue(trainer.trainerName);
            }

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
        
        const trainerName     = interaction.fields.getTextInputValue('trainerName');
        const firstName       = interaction.fields.getTextInputValue('firstName');
        const code            = interaction.fields.getTextInputValue('code');
        const levelValue      = interaction.fields.getTextInputValue('level');
        const favoritePokemon = interaction.fields.getTextInputValue('favoritePokemon');

        if (trainerName || firstName || code || levelValue || favoritePokemon) {
            const level = levelValue ? parseInt(levelValue) : null;

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
        }

        // Prompt the user to set their team if not already set
        if (!trainer || !trainer.team) {
            await TrainerTeamButtons.show(interaction);
        }
    }
};

export default TrainerProfileModal;