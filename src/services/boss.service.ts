import { EmbedBuilder } from 'discord.js';

import { bossRepository } from '@/database/repositories.js';
import { Boss, type BossUpdate, type BossDelete } from '@/database/entities/boss.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';
import { TranslationUtils } from '@/utils/translation.utils.js';
import { StringUtils } from '@/utils/string.utils.js';
import { MasterPokemonService } from '@/services/master-pokemon.service.js';
import { WikiLinkService } from '@/services/wiki-link.service.js';
import { PogoHubLinkService } from '@/services/pogo-hub-link.service.js';
import { MasterCPMService } from '@/services/master-cpm.service.js';

/**
 * Service layer for boss-related business logic
 */
export const BossService = {
    // ===== GET METHODS =====

    /**
     * Get boss by ID
     * @param id The boss ID
     * @returns Boss entity or null if not found
     */
    async get(id: string): Promise<Boss | null> {
        return await bossRepository.findOneBy({ id });
    },

    /**
     * Get all active bosses
     * @returns Array of active boss entities
     */
    async getActiveBosses(): Promise<Boss[]> {
        return await bossRepository.findBy({ isActive: true });
    },

    /**
     * Get bosses by type
     * @param bossType The boss type
     * @returns Array of boss entities of the specified type
     */
    async getByType(bossType: string): Promise<Boss[]> {
        return await bossRepository.findBy({ bossType });
    },

    /**
     * Get shinyable bosses
     * @returns Array of boss entities that can be shiny
     */
    async getShinyableBosses(): Promise<Boss[]> {
        return await bossRepository.findBy({ isShinyable: true });
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new boss entity
     * @param boss The full boss entity to create
     * @returns The created boss entity
     */
    async create(boss: Boss): Promise<Boss> {
        return await bossRepository.save(boss);
    },

    /**
     * Update an existing boss entity
     * @param boss Either a full entity or partial entity with updates
     * @returns The updated boss entity
     */
    async update(boss: Boss | BossUpdate): Promise<Boss | null> {
        if (boss instanceof Boss) {
            return await bossRepository.save(boss);
        }

        const bossEntity = await this.get(boss.id);

        if (!bossEntity) {
            throw new EntityNotFoundError('Boss', boss.id);
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (boss.bossType !== undefined) {
            bossEntity.bossType = boss.bossType;
        }
        if (boss.pokemonId !== undefined) {
            bossEntity.pokemonId = boss.pokemonId;
        }
        if (boss.form !== undefined) {
            bossEntity.form = boss.form;
        }
        if (boss.tier !== undefined) {
            bossEntity.tier = boss.tier;
        }
        if (boss.isMega !== undefined) {
            bossEntity.isMega = boss.isMega;
        }
        if (boss.isShadow !== undefined) {
            bossEntity.isShadow = boss.isShadow;
        }
        if (boss.isActive !== undefined) {
            bossEntity.isActive = boss.isActive;
        }
        if (boss.isShinyable !== undefined) {
            bossEntity.isShinyable = boss.isShinyable;
        }
        if (boss.templateId !== undefined) {
            bossEntity.templateId = boss.templateId;
        }

        return await bossRepository.save(bossEntity);
    },

    /**
     * Delete a boss entity
     * @param boss Either a full entity or an object with primary keys
     */
    async delete(boss: Boss | BossDelete): Promise<void> {
        const bossEntity = boss instanceof Boss ? boss : await this.get(boss.id);

        if (!bossEntity) {
            throw new EntityNotFoundError('Boss', boss.id);
        }

        await bossRepository.remove(bossEntity);
    },

    // ===== HELPER / FORMATTING METHODS =====

    /**
     * Get the boss type name for a boss entity
     * @param boss The boss entity
     * @returns The localized boss type name
     */
    getBossTypeName(boss: Boss): string {
        return TranslationUtils.getBossTypeName(boss.bossType);
    },

    /**
     * Get the battle type name for a boss entity
     * @param boss The boss entity
     * @returns The localized battle type name
     */
    getBattleTypeName(boss: Boss): string {
        return TranslationUtils.getBattleTypeName(boss.bossType);
    },

    // ===== BUILD EMBED METHODS =====

    /**
     * Build a Discord embed for a boss
     * @param boss The boss entity
     * @returns Discord embed builder
     */
    async buildEmbed(boss: Boss): Promise<EmbedBuilder> {
        const masterPokemon = await MasterPokemonService.get(boss.templateId);

        if (!masterPokemon) {
            throw new Error(`Master Pokémon with templateId ${boss.templateId} not found`);
        }

        const bossTypeName = this.getBossTypeName(boss);
        const pokemonName = await MasterPokemonService.getName(masterPokemon);

        let title = `#${masterPokemon.pokedexId} - ${bossTypeName} `;

        // Handle Mega and Shadow
        if (boss.isMega) {
            title += `${TranslationUtils.getMegaName()} `;
        }

        if (boss.isShadow) {
            title += `${TranslationUtils.getShadowName()} `;
        }

        title += pokemonName;

        if (masterPokemon.form !== null) {
            title += ` (${StringUtils.titleCase(masterPokemon.form)})`;
        }

        const typeColor = MasterPokemonService.getTypeColor(masterPokemon);
        let pokemonType = await MasterPokemonService.getTypeName(masterPokemon);

        const wikiLink = await WikiLinkService.getForBoss(boss);
        const pogoHubLink = await PogoHubLinkService.getForBoss(boss);

        let link = null;
        let thumbnail = null;

        if (wikiLink) {
            link = wikiLink.page;
            thumbnail = wikiLink.image;
        }

        if (pogoHubLink) {
            link = pogoHubLink.page;
        }

        if (masterPokemon.type2 != null) {
            pokemonType += ` / ${await MasterPokemonService.getType2Name(masterPokemon)}`;
        }

        const pokemonForm =
            masterPokemon.form != null
                ? StringUtils.titleCase(masterPokemon.form)
                : 'No Form';

        if (!pokemonType) {
            throw new Error(`No Pokémon type found for Pokémon ID ${boss.pokemonId}`);
        }

        // Calculate CP ranges
        const cpL20Min = await MasterCPMService.getCombatPower(masterPokemon, 10, 10, 10, 20);
        const cpL20Max = await MasterCPMService.getCombatPower(masterPokemon, 15, 15, 15, 20);
        const cpL25Min = await MasterCPMService.getCombatPower(masterPokemon, 10, 10, 10, 25);
        const cpL25Max = await MasterCPMService.getCombatPower(masterPokemon, 15, 15, 15, 25);

        const cpReg = `${cpL20Min} - ${cpL20Max}`;
        const cpWb = `${cpL25Min} - ${cpL25Max}`;

        let embed = new EmbedBuilder()
            .setColor(typeColor)
            .setTitle(title)
            .setURL(link)
            .setThumbnail(thumbnail);

        embed = embed.addFields(
            { name: 'Boss ID', value: boss.id },
            { name: 'Pokémon Type', value: pokemonType },
            { name: 'Pokémon Form', value: pokemonForm }
        );

        embed = embed.addFields(
            { name: 'Tier', value: `${boss.tier}`, inline: true },
            {
                name: 'Shiny',
                value: `${boss.isShinyable ? 'Can be Shiny' : 'Cannot be Shiny'}`,
                inline: true,
            },
            { name: 'Status', value: `${boss.isActive ? 'Active' : 'Inactive'}`, inline: true },
            { name: 'Mega', value: `${boss.isMega ? 'Yes' : 'No'}`, inline: true },
            { name: 'Shadow', value: `${boss.isShadow ? 'Yes' : 'No'}`, inline: true }
        );

        embed = embed.addFields(
            { name: 'CP Range', value: '10/10/10 - 15/15/15' },
            { name: 'CP L20', value: cpReg, inline: true },
            { name: 'CP L25 (WB)', value: cpWb, inline: true }
        );

        embed = embed.setTimestamp();

        return embed;
    },
};
