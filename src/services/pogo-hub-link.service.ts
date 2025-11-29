import { pogoHubLinkRepository } from '@/database/repositories.js';
import {
    PogoHubLink,
    type PogoHubLinkUpdate,
    type PogoHubLinkDelete,
} from '@/database/entities/pogo-hub-link.entity.js';
import { Boss } from '@/database/entities/boss.entity.js';
import { MasterPokemon } from '@/database/entities/master-pokemon.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';
import { BossType } from '@/constants.js';
import { masterPokemonRepository } from '@/database/repositories.js';

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

    // ===== SMART LOOKUP METHODS =====

    /**
     * Get Pogo Hub link for a boss entity with fallback logic.
     * Searches in order: exact match, pokemon name match, base record, pokemon name base.
     * Note: PogoHubLink entity only supports isMega and isGigantamax flags (no isShadow/isDynamax)
     * @param boss The boss entity
     * @returns PogoHubLink entity or null if not found
     */
    async getForBoss(boss: Boss): Promise<PogoHubLink | null> {
        const masterPokemon = await masterPokemonRepository.findOneBy({
            templateId: boss.templateId,
        });

        if (!masterPokemon) {
            throw new Error(`MasterPokemon not found for templateId: ${boss.templateId}`);
        }

        // First check for the pogo hub link record with the full search parameters
        // Note: PogoHubLink only tracks isMega and isGigantamax (not isShadow/isDynamax like WikiLink)
        let pogoHubLinks = await pogoHubLinkRepository.findBy({
            templateId: masterPokemon.templateId,
            isMega: boss.isMega,
            isGigantamax: boss.bossType === BossType.Gigantamax,
        });
        if (pogoHubLinks.length === 1) {
            return pogoHubLinks[0];
        }

        // Next check based on the pokemon name
        pogoHubLinks = await pogoHubLinkRepository.findBy({
            pokemonId: masterPokemon.pokemonId,
            form: undefined,
            isMega: boss.isMega,
            isGigantamax: boss.bossType === BossType.Gigantamax,
        });
        if (pogoHubLinks.length === 1) {
            return pogoHubLinks[0];
        }

        // Otherwise check for the base record
        pogoHubLinks = await pogoHubLinkRepository.findBy({
            templateId: masterPokemon.templateId,
            isMega: false,
            isGigantamax: false,
        });
        if (pogoHubLinks.length === 1) {
            return pogoHubLinks[0];
        }

        // And finally check for the base record with the pokemon name
        pogoHubLinks = await pogoHubLinkRepository.findBy({
            pokemonId: masterPokemon.pokemonId,
            form: undefined,
            isMega: false,
            isGigantamax: false,
        });
        if (pogoHubLinks.length === 1) {
            return pogoHubLinks[0];
        }

        return null;
    },

    /**
     * Get Pogo Hub link for a master pokémon entity with fallback logic.
     * Searches in order: base record with form, base record without form, id + pokemon name.
     * @param masterPokemon The master pokémon entity
     * @returns PogoHubLink entity or null if not found
     */
    async getForMasterPokemon(masterPokemon: MasterPokemon): Promise<PogoHubLink | null> {
        // First check for the base record
        let pogoHubLinks = await pogoHubLinkRepository.findBy({
            templateId: masterPokemon.templateId,
            form: masterPokemon.form ?? undefined,
            isMega: false,
            isGigantamax: false,
        });
        if (pogoHubLinks.length === 1) {
            return pogoHubLinks[0];
        }

        // Otherwise check for the base record without the form
        pogoHubLinks = await pogoHubLinkRepository.findBy({
            pokemonId: masterPokemon.pokemonId,
            form: undefined,
            isMega: false,
            isGigantamax: false,
        });
        if (pogoHubLinks.length === 1) {
            return pogoHubLinks[0];
        }

        // Final fallback: try with id field matching pokemon name (lowercase)
        // The id field is the primary key and may be set to the lowercased pokemon name
        // for base pokemon records. We also include pokemonId to ensure we get the correct record.
        pogoHubLinks = await pogoHubLinkRepository.findBy({
            id: masterPokemon.pokemonId.toLowerCase(),
            pokemonId: masterPokemon.pokemonId,
            form: undefined,
            isMega: false,
            isGigantamax: false,
        });
        if (pogoHubLinks.length === 1) {
            return pogoHubLinks[0];
        }

        return null;
    },
};
