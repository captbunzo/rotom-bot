import { pogoHubLinkRepository } from '@/database/repositories.js';
import {
    PogoHubLink,
    type PogoHubLinkUpdate,
    type PogoHubLinkDelete,
} from '@/database/entities/pogo-hub-link.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';

/**
 * Service layer for pogo hub link-related business logic
 */
export const PogoHubLinkService = {
    // ===== GET METHODS =====

    /**
     * Get pogo hub link by ID
     * @param id The pogo hub link ID
     * @returns PogoHubLink entity or null if not found
     */
    async get(id: string): Promise<PogoHubLink | null> {
        return await pogoHubLinkRepository.findOneBy({ id });
    },

    /**
     * Get pogo hub link by template ID
     * @param templateId The template ID
     * @returns PogoHubLink entity or null if not found
     */
    async getByTemplateId(templateId: string): Promise<PogoHubLink | null> {
        return await pogoHubLinkRepository.findOneBy({ templateId });
    },

    /**
     * Get pogo hub links by pokemon ID
     * @param pokemonId The pokemon ID
     * @returns Array of pogo hub link entities
     */
    async getByPokemonId(pokemonId: string): Promise<PogoHubLink[]> {
        return await pogoHubLinkRepository.findBy({ pokemonId });
    },

    /**
     * Get pogo hub links by pokedex ID
     * @param pokedexId The pokedex ID
     * @returns Array of pogo hub link entities
     */
    async getByPokedexId(pokedexId: number): Promise<PogoHubLink[]> {
        return await pogoHubLinkRepository.findBy({ pokedexId });
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new Pogo Hub link entity
     * @param pogoHubLink The full Pogo Hub link entity to create
     * @returns The created Pogo Hub link entity
     */
    async create(pogoHubLink: PogoHubLink): Promise<PogoHubLink> {
        return await pogoHubLinkRepository.save(pogoHubLink);
    },

    /**
     * Update an existing Pogo Hub link entity
     * @param pogoHubLink Either a full entity or partial entity with updates
     * @returns The updated Pogo Hub link entity
     */
    async update(pogoHubLink: PogoHubLink | PogoHubLinkUpdate): Promise<PogoHubLink | null> {
        if (pogoHubLink instanceof PogoHubLink) {
            return await pogoHubLinkRepository.save(pogoHubLink);
        }

        const pogoHubLinkEntity = await this.get(pogoHubLink.id);

        if (!pogoHubLinkEntity) {
            throw new EntityNotFoundError('PogoHubLink', pogoHubLink.id);
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (pogoHubLink.pokemonId !== undefined) {
            pogoHubLinkEntity.pokemonId = pogoHubLink.pokemonId;
        }
        if (pogoHubLink.pokedexId !== undefined) {
            pogoHubLinkEntity.pokedexId = pogoHubLink.pokedexId;
        }
        if (pogoHubLink.isMega !== undefined) {
            pogoHubLinkEntity.isMega = pogoHubLink.isMega;
        }
        if (pogoHubLink.isGigantamax !== undefined) {
            pogoHubLinkEntity.isGigantamax = pogoHubLink.isGigantamax;
        }
        if (pogoHubLink.page !== undefined) {
            pogoHubLinkEntity.page = pogoHubLink.page;
        }
        if (pogoHubLink.image !== undefined) {
            pogoHubLinkEntity.image = pogoHubLink.image;
        }
        if (pogoHubLink.templateId !== undefined) {
            pogoHubLinkEntity.templateId = pogoHubLink.templateId;
        }
        if (pogoHubLink.form !== undefined) {
            pogoHubLinkEntity.form = pogoHubLink.form;
        }

        return await pogoHubLinkRepository.save(pogoHubLinkEntity);
    },

    /**
     * Delete a Pogo Hub link entity
     * @param pogoHubLink Either a full entity or an object with primary keys
     */
    async delete(pogoHubLink: PogoHubLink | PogoHubLinkDelete): Promise<void> {
        const pogoHubLinkEntity =
            pogoHubLink instanceof PogoHubLink ? pogoHubLink : await this.get(pogoHubLink.id);

        if (!pogoHubLinkEntity) {
            throw new EntityNotFoundError('PogoHubLink', pogoHubLink.id);
        }

        await pogoHubLinkRepository.remove(pogoHubLinkEntity);
    },
};
