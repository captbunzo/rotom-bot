import { bossRepository } from '@/database/repositories.js';
import { Boss, type BossUpdate, type BossDelete } from '@/database/entities/boss.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';
import { TranslationUtils } from '@/utils/translation.utils.js';

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
        const bossEntity = boss instanceof Boss ? boss : await this.getById(boss.id);

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
};
