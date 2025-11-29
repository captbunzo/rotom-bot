import { pokedexPokemonRepository } from '@/database/repositories.js';
import {
    PokedexPokemon,
    type PokedexPokemonUpdate,
    type PokedexPokemonDelete,
} from '@/database/entities/pokedex-pokemon.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';

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
};
