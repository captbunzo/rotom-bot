import { wikiLinkRepository } from '@/database/repositories.js';
import {
    WikiLink,
    type WikiLinkUpdate,
    type WikiLinkDelete,
} from '@/database/entities/wiki-link.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';

/**
 * Service layer for wiki link-related business logic
 */
export const WikiLinkService = {
    // ===== GET METHODS =====

    /**
     * Get wiki link by ID
     * @param id The wiki link ID
     * @returns WikiLink entity or null if not found
     */
    async get(id: string): Promise<WikiLink | null> {
        return await wikiLinkRepository.findOneBy({ id });
    },

    /**
     * Get wiki link by template ID
     * @param templateId The template ID
     * @returns WikiLink entity or null if not found
     */
    async getByTemplateId(templateId: string): Promise<WikiLink | null> {
        return await wikiLinkRepository.findOneBy({ templateId });
    },

    /**
     * Get wiki links by pokemon ID
     * @param pokemonId The pokemon ID
     * @returns Array of wiki link entities
     */
    async getByPokemonId(pokemonId: string): Promise<WikiLink[]> {
        return await wikiLinkRepository.findBy({ pokemonId });
    },

    /**
     * Get wiki links by pokedex ID
     * @param pokedexId The pokedex ID
     * @returns Array of wiki link entities
     */
    async getByPokedexId(pokedexId: number): Promise<WikiLink[]> {
        return await wikiLinkRepository.findBy({ pokedexId });
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new wiki link entity
     * @param wikiLink The full wiki link entity to create
     * @returns The created wiki link entity
     */
    async create(wikiLink: WikiLink): Promise<WikiLink> {
        return await wikiLinkRepository.save(wikiLink);
    },

    /**
     * Update an existing wiki link entity
     * @param wikiLink Either a full entity or partial entity with updates
     * @returns The updated wiki link entity
     */
    async update(wikiLink: WikiLink | WikiLinkUpdate): Promise<WikiLink | null> {
        if (wikiLink instanceof WikiLink) {
            return await wikiLinkRepository.save(wikiLink);
        }

        const wikiLinkEntity = await this.get(wikiLink.id);

        if (!wikiLinkEntity) {
            throw new EntityNotFoundError('WikiLink', wikiLink.id);
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (wikiLink.pokemonId !== undefined) {
            wikiLinkEntity.pokemonId = wikiLink.pokemonId;
        }
        if (wikiLink.pokedexId !== undefined) {
            wikiLinkEntity.pokedexId = wikiLink.pokedexId;
        }
        if (wikiLink.isMega !== undefined) {
            wikiLinkEntity.isMega = wikiLink.isMega;
        }
        if (wikiLink.isShadow !== undefined) {
            wikiLinkEntity.isShadow = wikiLink.isShadow;
        }
        if (wikiLink.isDynamax !== undefined) {
            wikiLinkEntity.isDynamax = wikiLink.isDynamax;
        }
        if (wikiLink.isGigantamax !== undefined) {
            wikiLinkEntity.isGigantamax = wikiLink.isGigantamax;
        }
        if (wikiLink.page !== undefined) {
            wikiLinkEntity.page = wikiLink.page;
        }
        if (wikiLink.image !== undefined) {
            wikiLinkEntity.image = wikiLink.image;
        }
        if (wikiLink.templateId !== undefined) {
            wikiLinkEntity.templateId = wikiLink.templateId;
        }
        if (wikiLink.form !== undefined) {
            wikiLinkEntity.form = wikiLink.form;
        }

        return await wikiLinkRepository.save(wikiLinkEntity);
    },

    /**
     * Delete a wiki link entity
     * @param wikiLink Either a full entity or an object with primary keys
     */
    async delete(wikiLink: WikiLink | WikiLinkDelete): Promise<void> {
        const wikiLinkEntity =
            wikiLink instanceof WikiLink ? wikiLink : await this.get(wikiLink.id);

        if (!wikiLinkEntity) {
            throw new EntityNotFoundError('WikiLink', wikiLink.id);
        }

        await wikiLinkRepository.remove(wikiLinkEntity);
    },
};
