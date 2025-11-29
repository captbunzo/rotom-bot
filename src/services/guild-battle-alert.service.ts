import { guildBattleAlertRepository } from '@/database/repositories.js';
import {
    GuildBattleAlert,
    type GuildBattleAlertUpdate,
    type GuildBattleAlertDelete,
} from '@/database/entities/guild-battle-alert.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';

/**
 * Service layer for guild battle alert-related business logic
 */
export const GuildBattleAlertService = {
    // ===== GET METHODS =====

    /**
     * Get guild battle alert by ID
     * @param id The guild battle alert ID
     * @returns GuildBattleAlert entity or null if not found
     */
    async get(id: string): Promise<GuildBattleAlert | null> {
        return await guildBattleAlertRepository.findOneBy({ id });
    },

    /**
     * Get guild battle alerts by guild ID
     * @param guildId The Discord guild ID
     * @returns Array of guild battle alert entities
     */
    async getByGuildId(guildId: string): Promise<GuildBattleAlert[]> {
        return await guildBattleAlertRepository.findBy({ guildId });
    },

    /**
     * Get guild battle alert by guild and channel ID
     * @param guildId The Discord guild ID
     * @param channelId The Discord channel ID
     * @returns GuildBattleAlert entity or null if not found
     */
    async getByGuildAndChannelId(
        guildId: string,
        channelId: string
    ): Promise<GuildBattleAlert | null> {
        return await guildBattleAlertRepository.findOneBy({ guildId, channelId });
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new guild battle alert entity
     * @param guildBattleAlert The full guild battle alert entity to create
     * @returns The created guild battle alert entity
     */
    async create(guildBattleAlert: GuildBattleAlert): Promise<GuildBattleAlert> {
        return await guildBattleAlertRepository.save(guildBattleAlert);
    },

    /**
     * Update an existing guild battle alert entity
     * @param guildBattleAlert Either a full entity or partial entity with updates
     * @returns The updated guild battle alert entity
     */
    async update(
        guildBattleAlert: GuildBattleAlert | GuildBattleAlertUpdate
    ): Promise<GuildBattleAlert | null> {
        if (guildBattleAlert instanceof GuildBattleAlert) {
            return await guildBattleAlertRepository.save(guildBattleAlert);
        }

        const guildBattleAlertEntity = await this.get(guildBattleAlert.id);

        if (!guildBattleAlertEntity) {
            throw new EntityNotFoundError('GuildBattleAlert', guildBattleAlert.id);
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (guildBattleAlert.guildId !== undefined) {
            guildBattleAlertEntity.guildId = guildBattleAlert.guildId;
        }
        if (guildBattleAlert.roleId !== undefined) {
            guildBattleAlertEntity.roleId = guildBattleAlert.roleId;
        }
        if (guildBattleAlert.channelId !== undefined) {
            guildBattleAlertEntity.channelId = guildBattleAlert.channelId;
        }
        if (guildBattleAlert.bossType !== undefined) {
            guildBattleAlertEntity.bossType = guildBattleAlert.bossType;
        }
        if (guildBattleAlert.tier !== undefined) {
            guildBattleAlertEntity.tier = guildBattleAlert.tier;
        }
        if (guildBattleAlert.isMega !== undefined) {
            guildBattleAlertEntity.isMega = guildBattleAlert.isMega;
        }
        if (guildBattleAlert.isShadow !== undefined) {
            guildBattleAlertEntity.isShadow = guildBattleAlert.isShadow;
        }

        return await guildBattleAlertRepository.save(guildBattleAlertEntity);
    },

    /**
     * Delete a guild battle alert entity
     * @param guildBattleAlert Either a full entity or an object with primary keys
     */
    async delete(guildBattleAlert: GuildBattleAlert | GuildBattleAlertDelete): Promise<void> {
        const guildBattleAlertEntity =
            guildBattleAlert instanceof GuildBattleAlert
                ? guildBattleAlert
                : await this.get(guildBattleAlert.id);

        if (!guildBattleAlertEntity) {
            throw new EntityNotFoundError('GuildBattleAlert', guildBattleAlert.id);
        }

        await guildBattleAlertRepository.remove(guildBattleAlertEntity);
    },
};
