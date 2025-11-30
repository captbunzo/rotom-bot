import { EmbedBuilder } from 'discord.js';

import { pokedexPokemonRepository } from '@/database/repositories.js';
import {
    PokedexPokemon,
    type PokedexPokemonUpdate,
    type PokedexPokemonDelete,
} from '@/database/entities/pokedex-pokemon.entity.js';
import { MasterPokemon } from '@/database/entities/master-pokemon.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';
import { PokedexEntry } from '@/constants.js';
import { MasterPokemonService } from '@/services/master-pokemon.service.js';

/**
 * Service layer for pokedex pokemon-related business logic
 */
export const PokedexPokemonService = {
    // ===== GET METHODS =====

    /**
     * Get pokédex pokémon by Discord ID and pokédex ID
     * @param discordId The Discord user ID
     * @param pokedexId The pokédex ID
     * @returns PokedexPokemon entity or null if not found
     */
    async get(discordId: string, pokedexId: number): Promise<PokedexPokemon | null> {
        return await pokedexPokemonRepository.findOneBy({ discordId, pokedexId });
    },

    /**
     * Get pokédex pokémon by pokédex ID
     * @param pokedexId The pokédex ID
     * @returns Array of pokédex pokémon entities
     */
    async getByPokedexId(pokedexId: number): Promise<PokedexPokemon[]> {
        return await pokedexPokemonRepository.findBy({ pokedexId });
    },

    /**
     * Get all pokédex pokémon entities
     * @returns Array of all pokédex pokémon entities
     */
    async getAll(): Promise<PokedexPokemon[]> {
        return await pokedexPokemonRepository.find({ order: { pokedexId: 'ASC' } });
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new pokédex pokémon entity
     * @param pokedexPokemon The full pokédex pokémon entity to create
     * @returns The created pokédex pokémon entity
     */
    async create(pokedexPokemon: PokedexPokemon): Promise<PokedexPokemon> {
        return await pokedexPokemonRepository.save(pokedexPokemon);
    },

    /**
     * Update an existing pokédex pokémon entity
     * @param pokedexPokemon Either a full entity or partial entity with updates
     * @returns The updated pokédex pokémon entity
     */
    async update(
        pokedexPokemon: PokedexPokemon | PokedexPokemonUpdate
    ): Promise<PokedexPokemon | null> {
        if (pokedexPokemon instanceof PokedexPokemon) {
            return await pokedexPokemonRepository.save(pokedexPokemon);
        }

        const pokedexPokemonEntity = await this.get(
            pokedexPokemon.discordId,
            pokedexPokemon.pokedexId
        );

        if (!pokedexPokemonEntity) {
            throw new EntityNotFoundError('PokedexPokemon', {
                discordId: pokedexPokemon.discordId,
                pokedexId: pokedexPokemon.pokedexId,
            });
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (pokedexPokemon.form !== undefined) {
            pokedexPokemonEntity.form = pokedexPokemon.form;
        }
        if (pokedexPokemon.caught !== undefined) {
            pokedexPokemonEntity.caught = pokedexPokemon.caught;
        }
        if (pokedexPokemon.shiny !== undefined) {
            pokedexPokemonEntity.shiny = pokedexPokemon.shiny;
        }
        if (pokedexPokemon.hundo !== undefined) {
            pokedexPokemonEntity.hundo = pokedexPokemon.hundo;
        }
        if (pokedexPokemon.lucky !== undefined) {
            pokedexPokemonEntity.lucky = pokedexPokemon.lucky;
        }
        if (pokedexPokemon.xxl !== undefined) {
            pokedexPokemonEntity.xxl = pokedexPokemon.xxl;
        }
        if (pokedexPokemon.xxs !== undefined) {
            pokedexPokemonEntity.xxs = pokedexPokemon.xxs;
        }
        if (pokedexPokemon.shadow !== undefined) {
            pokedexPokemonEntity.shadow = pokedexPokemon.shadow;
        }
        if (pokedexPokemon.purified !== undefined) {
            pokedexPokemonEntity.purified = pokedexPokemon.purified;
        }
        if (pokedexPokemon.notes !== undefined) {
            pokedexPokemonEntity.notes = pokedexPokemon.notes;
        }

        return await pokedexPokemonRepository.save(pokedexPokemonEntity);
    },

    /**
     * Delete a pokédex pokémon entity
     * @param pokedexPokemon Either a full entity or an object with primary keys
     */
    async delete(pokedexPokemon: PokedexPokemon | PokedexPokemonDelete): Promise<void> {
        const pokedexPokemonEntity =
            pokedexPokemon instanceof PokedexPokemon
                ? pokedexPokemon
                : await this.get(pokedexPokemon.discordId, pokedexPokemon.pokedexId);

        if (!pokedexPokemonEntity) {
            throw new EntityNotFoundError('PokedexPokemon', {
                discordId: pokedexPokemon.discordId,
                pokedexId: pokedexPokemon.pokedexId,
            });
        }

        await pokedexPokemonRepository.remove(pokedexPokemonEntity);
    },

    // ===== BUILD EMBED METHODS =====

    /**
     * Build a Discord embed for a pokédex pokémon entry
     * @param pokedexPokemon The pokédex pokémon entity
     * @param masterPokemon Optional master pokémon entity (fetched if not provided)
     * @returns Discord embed builder
     */
    async buildEmbed(
        pokedexPokemon: PokedexPokemon,
        masterPokemon: MasterPokemon | null = null
    ): Promise<EmbedBuilder> {
        let masterPokemonFound = masterPokemon;

        if (!masterPokemonFound) {
            masterPokemonFound = await MasterPokemonService.getByPokedexIdAndForm(
                pokedexPokemon.pokedexId,
                pokedexPokemon.form || null
            );
            if (!masterPokemonFound) {
                throw new Error(
                    `Master Pokemon not found for Pokédex ID ${pokedexPokemon.pokedexId} and form ${pokedexPokemon.form}`
                );
            }
        }

        // Start building the embed using MasterPokemonService
        let embed = await MasterPokemonService.buildEmbed(masterPokemonFound, false);

        // Add the pokedex entries
        const pokedexEntries: string[] = [];

        if (pokedexPokemon.caught) pokedexEntries.push(PokedexEntry.Caught);
        if (pokedexPokemon.shiny) pokedexEntries.push(PokedexEntry.Shiny);
        if (pokedexPokemon.hundo) pokedexEntries.push(PokedexEntry.Hundo);
        if (pokedexPokemon.lucky) pokedexEntries.push(PokedexEntry.Lucky);
        if (pokedexPokemon.xxl) pokedexEntries.push(PokedexEntry.XXL);
        if (pokedexPokemon.xxs) pokedexEntries.push(PokedexEntry.XXS);
        if (pokedexPokemon.shadow) pokedexEntries.push(PokedexEntry.Shadow);
        if (pokedexPokemon.purified) pokedexEntries.push(PokedexEntry.Purified);

        let pokedexEntryString = 'None';

        if (pokedexEntries.length > 0) {
            pokedexEntryString = pokedexEntries.join(', ');
        }

        embed = embed.addFields({
            name: 'Pokédex Entries',
            value: pokedexEntryString,
            inline: false,
        });

        if (pokedexPokemon.notes) {
            embed = embed.addFields({
                name: 'Pokédex Notes',
                value: pokedexPokemon.notes || '',
                inline: false,
            });
        }

        embed = embed.setTimestamp(pokedexPokemon.updatedAt);

        return embed;
    },

    // ===== ENTRY MANAGEMENT METHODS =====

    /**
     * Set a specific pokédex entry
     * @param pokedexPokemon The pokédex pokémon entity
     * @param entry The pokédex entry to set
     * @param value The value to set (defaults to true)
     */
    setEntry(pokedexPokemon: PokedexPokemon, entry: PokedexEntry, value: boolean = true): void {
        switch (entry) {
            case PokedexEntry.Caught: {
                pokedexPokemon.caught = value;
                break;
            }
            case PokedexEntry.Shiny: {
                pokedexPokemon.shiny = value;
                break;
            }
            case PokedexEntry.Hundo: {
                pokedexPokemon.hundo = value;
                break;
            }
            case PokedexEntry.Lucky: {
                pokedexPokemon.lucky = value;
                break;
            }
            case PokedexEntry.XXL: {
                pokedexPokemon.xxl = value;
                break;
            }
            case PokedexEntry.XXS: {
                pokedexPokemon.xxs = value;
                break;
            }
            case PokedexEntry.Shadow: {
                pokedexPokemon.shadow = value;
                break;
            }
            case PokedexEntry.Purified: {
                pokedexPokemon.purified = value;
                break;
            }
        }
    },

    /**
     * Set all pokédex entries to true
     * @param pokedexPokemon The pokédex pokémon entity
     */
    setAllEntries(pokedexPokemon: PokedexPokemon): void {
        pokedexPokemon.caught = true;
        pokedexPokemon.shiny = true;
        pokedexPokemon.hundo = true;
        pokedexPokemon.lucky = true;
        pokedexPokemon.xxl = true;
        pokedexPokemon.xxs = true;
        pokedexPokemon.shadow = true;
        pokedexPokemon.purified = true;
    },

    /**
     * Clear all pokédex entries (set to false)
     * @param pokedexPokemon The pokédex pokémon entity
     */
    clearAllEntries(pokedexPokemon: PokedexPokemon): void {
        pokedexPokemon.caught = false;
        pokedexPokemon.shiny = false;
        pokedexPokemon.hundo = false;
        pokedexPokemon.lucky = false;
        pokedexPokemon.xxl = false;
        pokedexPokemon.xxs = false;
        pokedexPokemon.shadow = false;
        pokedexPokemon.purified = false;
    },
};
