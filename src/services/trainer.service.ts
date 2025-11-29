import { EmbedBuilder, type InteractionReplyOptions, MessageFlags } from 'discord.js';
import { ILike } from 'typeorm';

import { Team, TeamColor, MaxAutoCompleteChoices } from '@/constants.js';
import { trainerRepository } from '@/database/repositories.js';
import {
    Trainer,
    type TrainerUpdate,
    type TrainerDelete,
} from '@/database/entities/trainer.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';

/**
 * Service layer for trainer-related business logic
 */
export const TrainerService = {
    // ===== GET METHODS =====

    /**
     * Get trainer by Discord ID
     * @param discordId The Discord user ID
     * @returns Trainer entity or null if not found
     */
    async get(discordId: string): Promise<Trainer | null> {
        return await trainerRepository.findOneBy({ discordId });
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new trainer entity
     * @param trainer The full trainer entity to create
     * @returns The created trainer entity
     */
    async create(trainer: Trainer): Promise<Trainer> {
        return await trainerRepository.save(trainer);
    },

    /**
     * Update an existing trainer entity
     * @param trainer Either a full entity or partial entity with updates
     * @returns The updated trainer entity
     */
    async update(trainer: Trainer | TrainerUpdate): Promise<Trainer | null> {
        if (trainer instanceof Trainer) {
            return await trainerRepository.save(trainer);
        }

        const trainerEntity = await this.get(trainer.discordId);

        if (!trainerEntity) {
            throw new EntityNotFoundError('Trainer', trainer.discordId);
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (trainer.trainerName !== undefined) {
            trainerEntity.trainerName = trainer.trainerName;
        }
        if (trainer.firstName !== undefined) {
            trainerEntity.firstName = trainer.firstName;
        }
        if (trainer.code !== undefined) {
            trainerEntity.code = trainer.code;
        }
        if (trainer.level !== undefined) {
            trainerEntity.level = trainer.level;
        }
        if (trainer.team !== undefined) {
            trainerEntity.team = trainer.team;
        }
        if (trainer.aboutMe !== undefined) {
            trainerEntity.aboutMe = trainer.aboutMe;
        }
        if (trainer.favoritePokemon !== undefined) {
            trainerEntity.favoritePokemon = trainer.favoritePokemon;
        }

        return await trainerRepository.save(trainerEntity);
    },

    /**
     * Delete a trainer entity
     * @param trainer Either a full entity or an object with primary keys
     */
    async delete(trainer: Trainer | TrainerDelete): Promise<void> {
        const trainerEntity =
            trainer instanceof Trainer ? trainer : await this.get(trainer.discordId);

        if (!trainerEntity) {
            throw new EntityNotFoundError('Trainer', trainer.discordId);
        }

        await trainerRepository.remove(trainerEntity);
    },

    // ===== BUILD EMBED METHODS =====

    /**
     * Build a Discord embed for a trainer profile
     * @param trainer The trainer entity
     * @returns Discord embed builder
     */
    buildEmbed(trainer: Trainer): EmbedBuilder {
        let color = 0x59_57_61;

        switch (trainer.team) {
            case Team.Instinct: {
                color = TeamColor.Instinct;
                break;
            }
            case Team.Mystic: {
                color = TeamColor.Mystic;
                break;
            }
            case Team.Valor: {
                color = TeamColor.Valor;
                break;
            }
        }

        const formattedCode = this.formatTrainerCode(trainer.code);

        const embed = new EmbedBuilder()
            .setColor(color)
            .setTitle(`${trainer.trainerName}'s Profile`)
            .setDescription(`Trainer Code: ${formattedCode}`)
            .addFields(
                { name: 'First Name', value: trainer.firstName ?? 'N/A', inline: true },
                { name: 'Team', value: trainer.team ?? 'N/A', inline: true },
                {
                    name: 'Level',
                    value: trainer.level ? trainer.level.toString() : 'N/A',
                    inline: true,
                }
            )
            .addFields({ name: 'Favorite Pokemon', value: trainer.favoritePokemon ?? 'N/A' });

        return embed;
    },

    // ===== HELPER / FORMATTING METHODS =====

    /**
     * Format a trainer code with spaces every 4 characters
     * @param code The trainer code (12 digits)
     * @returns Formatted trainer code with spaces
     */
    formatTrainerCode(code: string | null): string | null {
        if (!code) {
            return null;
        }

        const match = code.match(/.{1,4}/g);
        return match ? match.join(' ').trim() : null;
    },

    /**
     * Get the appropriate message to show when a trainer needs to set up their profile
     * @param trainer The trainer entity (null if not found)
     * @returns Discord interaction reply options
     */
    getSetupTrainerFirstMessage(trainer: Trainer | null): InteractionReplyOptions {
        if (trainer && (!trainer.trainerName || !trainer.code)) {
            return {
                content: `Please set your trainer name and code first with /setup-profile`,
                flags: MessageFlags.Ephemeral,
            };
        }

        return {
            content: `Please setup your profile first with /setup-profile`,
            flags: MessageFlags.Ephemeral,
        };
    },

    /**
     * Check if trainer has required setup (name and code)
     * @param trainer The trainer entity
     * @returns True if trainer has both name and code
     */
    isSetupComplete(trainer: Trainer | null): boolean {
        return !!(trainer && trainer.trainerName && trainer.code);
    },

    // ===== TEAM MANAGEMENT METHODS =====

    /**
     * Update a trainer's team, creating the trainer if they don't exist
     * @param discordId The Discord user ID
     * @param team The team to assign
     * @returns The updated trainer entity
     */
    async updateTeam(discordId: string, team: string): Promise<Trainer> {
        let trainer = await this.get(discordId);

        if (trainer) {
            trainer.team = team;
            return (await this.update(trainer)) as Trainer;
        }

        trainer = new Trainer();
        trainer.discordId = discordId;
        return await this.create(trainer);
    },

    /**
     * Remove a trainer's team assignment
     * @param discordId The Discord user ID
     * @returns The updated trainer entity
     */
    async deleteTeam(discordId: string): Promise<Trainer> {
        let trainer = await this.get(discordId);

        if (trainer) {
            trainer.team = null;
            return (await this.update(trainer)) as Trainer;
        }

        trainer = new Trainer();
        trainer.discordId = discordId;
        return await this.create(trainer);
    },

    // ===== AUTOCOMPLETE / CHOICE METHODS =====

    /**
     * Get trainer name choices for autocomplete
     * @param prefix The prefix to search for
     * @returns Array of trainer names matching the prefix
     */
    async getTrainerNameChoices(prefix: string): Promise<string[]> {
        const trainers = await trainerRepository.find({
            where: {
                trainerName: ILike(`${prefix}%`),
            },
            select: ['trainerName'],
            order: { trainerName: 'ASC' },
            take: MaxAutoCompleteChoices,
        });

        return trainers
            .filter((t) => t.trainerName !== null)
            .map((t) => t.trainerName as string);
    },

    /**
     * Get first name choices for autocomplete
     * @param prefix The prefix to search for
     * @returns Array of first names matching the prefix
     */
    async getFirstNameChoices(prefix: string): Promise<string[]> {
        const trainers = await trainerRepository.find({
            where: {
                firstName: ILike(`${prefix}%`),
            },
            select: ['firstName'],
            order: { firstName: 'ASC' },
            take: MaxAutoCompleteChoices,
        });

        return trainers
            .filter((t) => t.firstName !== null)
            .map((t) => t.firstName as string);
    },
};
