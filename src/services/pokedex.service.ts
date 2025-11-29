import {
    Pokedex,
    type PokedexUpdate,
    type PokedexDelete,
} from '@/database/entities/pokedex.entity';

import { pokedexRepository } from '@/database/repositories';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';

/**
 * Service layer for pokedex-related business logic
 */
export const PokedexService = {
    // ===== GET METHODS =====

    /**
     * Get pokedex by Discord ID
     * @param discordId The Discord ID
     * @returns Pokedex or null if not found
     */
    async get(discordId: string): Promise<Pokedex | null> {
        return await pokedexRepository.findOneBy({ discordId });
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new pokedex entry
     * @param pokedex The full pokedex entity to create
     * @returns The created pokedex entity
     */
    async create(pokedex: Pokedex): Promise<Pokedex> {
        return await pokedexRepository.save(pokedex);
    },

    /**
     * Update an existing pokedex entry
     * @param pokedex Either a full entity or partial entity with updates
     * @returns The updated pokedex entity
     */
    async update(pokedex: Pokedex | PokedexUpdate): Promise<Pokedex | null> {
        if (pokedex instanceof Pokedex) {
            return await pokedexRepository.save(pokedex);
        }

        const pokedexEntity = await this.get(pokedex.discordId);

        if (!pokedexEntity) {
            throw new EntityNotFoundError('Pokedex', pokedex.discordId);
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (pokedex.isPrivate !== undefined) {
            pokedexEntity.isPrivate = pokedex.isPrivate;
        }

        return await pokedexRepository.save(pokedexEntity);
    },

    /**
     * Delete a pokedex entry
     * @param pokedex Either a full entity or an object with primary keys
     */
    async delete(pokedex: Pokedex | PokedexDelete): Promise<void> {
        const pokedexEntity =
            pokedex instanceof Pokedex ? pokedex : await this.get(pokedex.discordId);

        if (!pokedexEntity) {
            throw new EntityNotFoundError('Pokedex', pokedex.discordId);
        }

        await pokedexRepository.remove(pokedexEntity);
    },
};
