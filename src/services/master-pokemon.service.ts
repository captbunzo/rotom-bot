import { EmbedBuilder } from 'discord.js';
import { ILike } from 'typeorm';

import { masterPokemonRepository } from '@/database/repositories.js';
import {
    MasterPokemon,
    type MasterPokemonUpdate,
    type MasterPokemonDelete,
} from '@/database/entities/master-pokemon.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';
import { PokemonTypeColor, MaxAutoCompleteChoices } from '@/constants.js';
import { translationRepository } from '@/database/repositories.js';
import { MasterCPMService } from '@/services/master-cpm.service.js';
import { WikiLinkService } from '@/services/wiki-link.service.js';
import { PogoHubLinkService } from '@/services/pogo-hub-link.service.js';
import { StringUtils } from '@/utils/string.utils.js';

/**
 * Service layer for master pokemon-related business logic
 */
export const MasterPokemonService = {
    // ===== GET METHODS =====

    /**
     * Get master pokémon by template ID
     * @param templateId The template ID
     * @returns MasterPokemon entity or null if not found
     */
    async get(templateId: string): Promise<MasterPokemon | null> {
        return await masterPokemonRepository.findOneBy({ templateId });
    },

    /**
     * Get master pokémon by pokédex ID
     * @param pokedexId The pokédex ID
     * @returns Array of master pokémon entities
     */
    async getByPokedexId(pokedexId: number): Promise<MasterPokemon[]> {
        return await masterPokemonRepository.findBy({ pokedexId });
    },

    /**
     * Get master pokémon by pokédex ID and form
     * @param pokedexId The pokédex ID
     * @param form The form (or null for default form)
     * @returns MasterPokemon entity or null if not found
     */
    async getByPokedexIdAndForm(
        pokedexId: number,
        form: string | null
    ): Promise<MasterPokemon | null> {
        return await masterPokemonRepository.findOneBy({ pokedexId, form });
    },

    /**
     * Get all master pokémon
     * @returns Array of all master pokémon entities
     */
    async getAll(): Promise<MasterPokemon[]> {
        return await masterPokemonRepository.find();
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new master pokémon entity
     * @param masterPokemon The full master pokémon entity to create
     * @returns The created master pokémon entity
     */
    async create(masterPokemon: MasterPokemon): Promise<MasterPokemon> {
        return await masterPokemonRepository.save(masterPokemon);
    },

    /**
     * Update an existing master pokémon entity
     * @param masterPokemon Either a full entity or partial entity with updates
     * @returns The updated master pokémon entity
     */
    async update(
        masterPokemon: MasterPokemon | MasterPokemonUpdate
    ): Promise<MasterPokemon | null> {
        if (masterPokemon instanceof MasterPokemon) {
            return await masterPokemonRepository.save(masterPokemon);
        }

        const masterPokemonEntity = await this.get(masterPokemon.templateId);

        if (!masterPokemonEntity) {
            throw new EntityNotFoundError('MasterPokemon', masterPokemon.templateId);
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (masterPokemon.pokemonId !== undefined) {
            masterPokemonEntity.pokemonId = masterPokemon.pokemonId;
        }
        if (masterPokemon.pokedexId !== undefined) {
            masterPokemonEntity.pokedexId = masterPokemon.pokedexId;
        }
        if (masterPokemon.type !== undefined) {
            masterPokemonEntity.type = masterPokemon.type;
        }
        if (masterPokemon.type2 !== undefined) {
            masterPokemonEntity.type2 = masterPokemon.type2;
        }
        if (masterPokemon.form !== undefined) {
            masterPokemonEntity.form = masterPokemon.form;
        }
        if (masterPokemon.formMaster !== undefined) {
            masterPokemonEntity.formMaster = masterPokemon.formMaster;
        }
        if (masterPokemon.baseAttack !== undefined) {
            masterPokemonEntity.baseAttack = masterPokemon.baseAttack;
        }
        if (masterPokemon.baseDefense !== undefined) {
            masterPokemonEntity.baseDefense = masterPokemon.baseDefense;
        }
        if (masterPokemon.baseStamina !== undefined) {
            masterPokemonEntity.baseStamina = masterPokemon.baseStamina;
        }
        if (masterPokemon.candyToEvolve !== undefined) {
            masterPokemonEntity.candyToEvolve = masterPokemon.candyToEvolve;
        }
        if (masterPokemon.buddyDistanceKm !== undefined) {
            masterPokemonEntity.buddyDistanceKm = masterPokemon.buddyDistanceKm;
        }
        if (masterPokemon.purifyStardust !== undefined) {
            masterPokemonEntity.purifyStardust = masterPokemon.purifyStardust;
        }

        return await masterPokemonRepository.save(masterPokemonEntity);
    },

    /**
     * Delete a master pokémon entity
     * @param masterPokemon Either a full entity or an object with primary keys
     */
    async delete(masterPokemon: MasterPokemon | MasterPokemonDelete): Promise<void> {
        const masterPokemonEntity =
            masterPokemon instanceof MasterPokemon
                ? masterPokemon
                : await this.get(masterPokemon.templateId);

        if (!masterPokemonEntity) {
            throw new EntityNotFoundError('MasterPokemon', masterPokemon.templateId);
        }

        await masterPokemonRepository.remove(masterPokemonEntity);
    },

    // ===== TRANSLATION AND UTILITY METHODS =====

    /**
     * Get Pokémon name in specified language
     * @param pokemon The master pokémon entity
     * @param language The language code (defaults to English)
     * @returns The translated name or null if not found
     */
    async getName(pokemon: MasterPokemon, language = 'en'): Promise<string | null> {
        const translation = await translationRepository.findOneBy({
            name: 'poke',
            key: pokemon.pokedexId,
            variant: '-',
            language: language,
        });
        return translation ? translation.value : null;
    },

    /**
     * Get Pokémon description in specified language
     * @param pokemon The master pokémon entity
     * @param language The language code (defaults to English)
     * @returns The translated description or null if not found
     */
    async getDescription(pokemon: MasterPokemon, language = 'en'): Promise<string | null> {
        const translation = await translationRepository.findOneBy({
            name: 'desc',
            key: pokemon.pokedexId,
            variant: '-',
            language: language,
        });
        return translation ? translation.value : null;
    },

    /**
     * Get primary type name in specified language
     * @param pokemon The master pokémon entity
     * @param language The language code (defaults to English)
     * @returns The translated type name or null if not found
     */
    async getTypeName(pokemon: MasterPokemon, language = 'en'): Promise<string | null> {
        const typeKey = this.getTypeKey(pokemon.type);
        if (!typeKey) return null;

        const translation = await translationRepository.findOneBy({
            name: 'poke_type',
            key: typeKey,
            variant: '-',
            language: language,
        });
        return translation ? translation.value : null;
    },

    /**
     * Get secondary type name in specified language
     * @param pokemon The master pokémon entity
     * @param language The language code (defaults to English)
     * @returns The translated type name or null if no secondary type or not found
     */
    async getType2Name(pokemon: MasterPokemon, language = 'en'): Promise<string | null> {
        if (pokemon.type2 == null) return null;

        const typeKey = this.getTypeKey(pokemon.type2);
        if (!typeKey) return null;

        const translation = await translationRepository.findOneBy({
            name: 'poke_type',
            key: typeKey,
            variant: '-',
            language: language,
        });
        return translation ? translation.value : null;
    },

    /**
     * Get primary type color
     * @param pokemon The master pokémon entity
     * @returns The color value for the primary type
     */
    getTypeColor(pokemon: MasterPokemon): number {
        return this.getTypeColorByType(pokemon.type);
    },

    /**
     * Get secondary type color
     * @param pokemon The master pokémon entity
     * @returns The color value for the secondary type or null if no secondary type
     */
    getType2Color(pokemon: MasterPokemon): number | null {
        if (pokemon.type2 != null) {
            return this.getTypeColorByType(pokemon.type2);
        }
        return null;
    },

    /**
     * Calculate combat power for specific IVs and level
     * @param pokemon The master pokémon entity
     * @param attack Attack IV (0-15)
     * @param defense Defense IV (0-15)
     * @param stamina Stamina IV (0-15)
     * @param level Pokémon level
     * @returns The calculated combat power
     */
    async getCombatPower(
        pokemon: MasterPokemon,
        attack: number,
        defense: number,
        stamina: number,
        level: number
    ): Promise<number> {
        return await MasterCPMService.getCombatPower(pokemon, attack, defense, stamina, level);
    },

    /**
     * Calculate combat power for perfect IVs (15/15/15) at specified level
     * @param pokemon The master pokémon entity
     * @param level Pokémon level
     * @returns The calculated combat power for perfect IVs
     */
    async getHundoCombatPower(pokemon: MasterPokemon, level: number): Promise<number> {
        return await MasterCPMService.getCombatPower(pokemon, 15, 15, 15, level);
    },

    // ===== HELPER METHODS =====

    /**
     * Get type key for translation lookup
     * @param type The Pokémon type string
     * @returns The type key number for translation lookup
     */
    getTypeKey(type: string): number | null {
        switch (type.toUpperCase()) {
            case 'NORMAL':
                return 1;
            case 'FIGHTING':
                return 2;
            case 'FLYING':
                return 3;
            case 'POISON':
                return 4;
            case 'GROUND':
                return 5;
            case 'ROCK':
                return 6;
            case 'BUG':
                return 7;
            case 'GHOST':
                return 8;
            case 'STEEL':
                return 9;
            case 'FIRE':
                return 10;
            case 'WATER':
                return 11;
            case 'GRASS':
                return 12;
            case 'ELECTRIC':
                return 13;
            case 'PSYCHIC':
                return 14;
            case 'ICE':
                return 15;
            case 'DRAGON':
                return 16;
            case 'DARK':
                return 17;
            case 'FAIRY':
                return 18;
            default:
                return null;
        }
    },

    /**
     * Get type color by type string (internal helper)
     * @param type The Pokémon type string
     * @returns The color value for the type
     */
    getTypeColorByType(type: string): number {
        let typeColor: number | undefined;

        switch (type.toUpperCase()) {
            case 'BUG':
                typeColor = PokemonTypeColor.Bug;
                break;
            case 'DARK':
                typeColor = PokemonTypeColor.Dark;
                break;
            case 'DRAGON':
                typeColor = PokemonTypeColor.Dragon;
                break;
            case 'ELECTRIC':
                typeColor = PokemonTypeColor.Electric;
                break;
            case 'FAIRY':
                typeColor = PokemonTypeColor.Fairy;
                break;
            case 'FIGHTING':
                typeColor = PokemonTypeColor.Fighting;
                break;
            case 'FIRE':
                typeColor = PokemonTypeColor.Fire;
                break;
            case 'FLYING':
                typeColor = PokemonTypeColor.Flying;
                break;
            case 'GHOST':
                typeColor = PokemonTypeColor.Ghost;
                break;
            case 'GRASS':
                typeColor = PokemonTypeColor.Grass;
                break;
            case 'GROUND':
                typeColor = PokemonTypeColor.Ground;
                break;
            case 'ICE':
                typeColor = PokemonTypeColor.Ice;
                break;
            case 'NORMAL':
                typeColor = PokemonTypeColor.Normal;
                break;
            case 'POISON':
                typeColor = PokemonTypeColor.Poison;
                break;
            case 'PSYCHIC':
                typeColor = PokemonTypeColor.Psychic;
                break;
            case 'ROCK':
                typeColor = PokemonTypeColor.Rock;
                break;
            case 'STEEL':
                typeColor = PokemonTypeColor.Steel;
                break;
            case 'WATER':
                typeColor = PokemonTypeColor.Water;
                break;
        }

        if (!typeColor) {
            throw new Error(`Unknown Pokémon type: ${type}`);
        }

        return typeColor;
    },

    // ===== BUILD EMBED METHODS =====

    /**
     * Build a Discord embed for a master pokémon
     * @param pokemon The master pokémon entity
     * @param full Whether to include full details (description, evolution info)
     * @returns Discord embed builder
     */
    async buildEmbed(pokemon: MasterPokemon, full: boolean = true): Promise<EmbedBuilder> {
        const pokemonName = await this.getName(pokemon);
        let title = `#${pokemon.pokedexId} - ${pokemonName}`;

        if (pokemon.form !== null) {
            title += ` (${StringUtils.titleCase(pokemon.form)})`;
        }

        const description = full
            ? (await this.getDescription(pokemon)) ?? 'Description not available'
            : null;
        const wikiLink = await WikiLinkService.getForMasterPokemon(pokemon);
        const pogoHubLink = await PogoHubLinkService.getForMasterPokemon(pokemon);

        let link = null;
        let thumbnail = null;

        if (wikiLink) {
            link = wikiLink.page;
            thumbnail = wikiLink.image;
        }

        if (pogoHubLink) {
            link = pogoHubLink.page;
        }

        const typeColor = this.getTypeColor(pokemon);
        let pokemonType = await this.getTypeName(pokemon);

        if (pokemon.type2 != null) {
            pokemonType += ` / ${await this.getType2Name(pokemon)}`;
        }

        const pokemonForm = pokemon.form != null ? StringUtils.titleCase(pokemon.form) : 'No Form';

        if (!pokemonType) {
            throw new Error(`Unknown Pokémon type: ${pokemon.type}`);
        }

        let embed = new EmbedBuilder()
            .setColor(typeColor)
            .setTitle(title)
            .setURL(link)
            .setThumbnail(thumbnail);

        if (full && description) {
            embed = embed.setDescription(description);
        }

        embed = embed.addFields(
            { name: 'Pokémon Type', value: pokemonType, inline: true },
            { name: 'Pokémon Form', value: pokemonForm, inline: true }
        );

        if (full) {
            const candyToEvolve = pokemon.candyToEvolve
                ? pokemon.candyToEvolve.toString()
                : 'Does not evolve';
            const buddyDistanceKm = pokemon.buddyDistanceKm
                ? `${pokemon.buddyDistanceKm.toString()} km`
                : 'Unknown';
            const purifyStardust = pokemon.purifyStardust
                ? pokemon.purifyStardust.toLocaleString()
                : 'Unknown';

            embed = embed.addFields(
                { name: 'Candy to Evolve', value: candyToEvolve, inline: true },
                { name: 'Buddy Distance', value: buddyDistanceKm, inline: true },
                { name: 'Purification Stardust', value: purifyStardust, inline: true }
            );
        }

        return embed;
    },

    // ===== AUTOCOMPLETE / CHOICE METHODS =====

    /**
     * Get pokemon ID choices for autocomplete
     * @param prefix The prefix to search for
     * @param conditions Optional additional conditions
     * @returns Array of pokemon IDs matching the prefix
     */
    async getPokemonIdChoices(
        prefix: string,
        conditions: Partial<MasterPokemon> = {}
    ): Promise<string[]> {
        const whereConditions: Record<string, unknown> = {
            ...conditions,
            pokemonId: ILike(`${prefix}%`),
        };

        const pokemon = await masterPokemonRepository.find({
            where: whereConditions,
            select: ['pokemonId'],
            order: { pokemonId: 'ASC' },
            take: MaxAutoCompleteChoices,
        });

        // Get unique values
        const uniqueIds = [...new Set(pokemon.map((p) => p.pokemonId))];
        return uniqueIds;
    },

    /**
     * Get template ID choices for autocomplete
     * @param prefix The prefix to search for
     * @param conditions Optional additional conditions
     * @returns Array of template IDs matching the prefix
     */
    async getTemplateIdChoices(
        prefix: string,
        conditions: Partial<MasterPokemon> = {}
    ): Promise<string[]> {
        const whereConditions: Record<string, unknown> = {
            ...conditions,
            templateId: ILike(`${prefix}%`),
        };

        const pokemon = await masterPokemonRepository.find({
            where: whereConditions,
            select: ['templateId'],
            order: { templateId: 'ASC' },
            take: MaxAutoCompleteChoices,
        });

        return pokemon.map((p) => p.templateId);
    },

    /**
     * Get form choices for autocomplete
     * @param prefix The prefix to search for
     * @param conditions Optional additional conditions
     * @returns Array of forms matching the prefix
     */
    async getFormChoices(
        prefix: string,
        conditions: Partial<MasterPokemon> = {}
    ): Promise<string[]> {
        const whereConditions: Record<string, unknown> = {
            ...conditions,
            form: ILike(`${prefix}%`),
        };

        const pokemon = await masterPokemonRepository.find({
            where: whereConditions,
            select: ['form'],
            order: { form: 'ASC' },
            take: MaxAutoCompleteChoices,
        });

        // Get unique values, filter out nulls
        const uniqueForms = [...new Set(pokemon.filter((p) => p.form !== null).map((p) => p.form as string))];
        return uniqueForms;
    },
};
