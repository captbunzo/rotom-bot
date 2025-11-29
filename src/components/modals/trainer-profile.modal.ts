import {
    ActionRowBuilder,
    ChatInputCommandInteraction,
    MessageFlags,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';

import { Trainer } from '@/database/entities/trainer.entity';
import { TrainerService } from '@/services/trainer.service';

import type { ModalComponent } from '@/types/component';
import { ComponentIndex } from '@/types/component-index';
import { TrainerTeamButtons } from '@/components/buttons/trainer-team.buttons';

export class TrainerProfileModal implements ModalComponent {
    name = 'TrainerProfileModal';
    id = 'modal';

    async show(interaction: ChatInputCommandInteraction) {
        const componentIndex = new ComponentIndex({
            name: this.name,
            id: this.id,
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

        const trainer = await TrainerService.get(interaction.user.id);

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
        void interaction.showModal(modal);
    }

    async handleModalSubmit(interaction: ModalSubmitInteraction) {
        const trainerName = interaction.fields.getTextInputValue('trainerName');
        const firstName = interaction.fields.getTextInputValue('firstName');
        const code = interaction.fields.getTextInputValue('code');
        const levelValue = interaction.fields.getTextInputValue('level');
        const favoritePokemon = interaction.fields.getTextInputValue('favoritePokemon');

        let trainer = await TrainerService.get(interaction.user.id);

        if (trainerName || firstName || code || levelValue || favoritePokemon) {
            const level = levelValue ? Number.parseInt(levelValue) : null;

            if (trainer) {
                trainer.trainerName = trainerName;
                trainer.firstName = firstName;
                trainer.code = code;
                trainer.level = level;
                trainer.favoritePokemon = favoritePokemon;
                await TrainerService.update(trainer);
            } else {
                trainer = new Trainer();
                trainer.discordId = interaction.user.id;
                trainer.trainerName = trainerName;
                trainer.firstName = firstName;
                trainer.code = code;
                trainer.level = level;
                trainer.favoritePokemon = favoritePokemon;
                await TrainerService.create(trainer);
            }

            await interaction.reply({
                content: `Trainer profile updated`,
                flags: MessageFlags.Ephemeral,
            });
        }

        // Prompt the user to set their team if not already set
        if (!trainer || !trainer.team) {
            await new TrainerTeamButtons().show(interaction);
        }
    }
}

export const component = new TrainerProfileModal();
