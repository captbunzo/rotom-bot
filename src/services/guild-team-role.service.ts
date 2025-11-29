import { guildTeamRoleRepository } from '@/database/repositories.js';
import {
    GuildTeamRole,
    type GuildTeamRoleUpdate,
    type GuildTeamRoleDelete,
} from '@/database/entities/guild-team-role.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';

/**
 * Service layer for guild team role-related business logic
 */
export const GuildTeamRoleService = {
    // ===== GET METHODS =====

    /**
     * Get guild team roles by guild ID
     * @param guildId The Discord guild ID
     * @returns Array of guild team role entities
     */
    async getByGuildId(guildId: string): Promise<GuildTeamRole[]> {
        return await guildTeamRoleRepository.findBy({ guildId });
    },

    /**
     * Get guild team role by guild ID and team
     * @param guildId The Discord guild ID
     * @param team The team name
     * @returns GuildTeamRole entity or null if not found
     */
    async get(guildId: string, team: string): Promise<GuildTeamRole | null> {
        return await guildTeamRoleRepository.findOneBy({ guildId, team });
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new guild team role entity
     * @param guildTeamRole The full guild team role entity to create
     * @returns The created guild team role entity
     */
    async create(guildTeamRole: GuildTeamRole): Promise<GuildTeamRole> {
        return await guildTeamRoleRepository.save(guildTeamRole);
    },

    /**
     * Update an existing guild team role entity
     * @param guildTeamRole Either a full entity or partial entity with updates
     * @returns The updated guild team role entity
     */
    async update(
        guildTeamRole: GuildTeamRole | GuildTeamRoleUpdate
    ): Promise<GuildTeamRole | null> {
        if (guildTeamRole instanceof GuildTeamRole) {
            return await guildTeamRoleRepository.save(guildTeamRole);
        }

        const guildTeamRoleEntity = await this.get(guildTeamRole.guildId, guildTeamRole.team);

        if (!guildTeamRoleEntity) {
            throw new EntityNotFoundError('GuildTeamRole', {
                guildId: guildTeamRole.guildId,
                team: guildTeamRole.team,
            });
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (guildTeamRole.roleId !== undefined) {
            guildTeamRoleEntity.roleId = guildTeamRole.roleId;
        }

        return await guildTeamRoleRepository.save(guildTeamRoleEntity);
    },

    /**
     * Delete a guild team role entity
     * @param guildTeamRole Either a full entity or an object with primary keys
     */
    async delete(guildTeamRole: GuildTeamRole | GuildTeamRoleDelete): Promise<void> {
        const guildTeamRoleEntity =
            guildTeamRole instanceof GuildTeamRole
                ? guildTeamRole
                : await this.get(guildTeamRole.guildId, guildTeamRole.team);

        if (!guildTeamRoleEntity) {
            throw new EntityNotFoundError('GuildTeamRole', {
                guildId: guildTeamRole.guildId,
                team: guildTeamRole.team,
            });
        }

        await guildTeamRoleRepository.remove(guildTeamRoleEntity);
    },
};
