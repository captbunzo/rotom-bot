import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * GuildTeamRole entity representing team role assignments for Discord guilds
 */
@Entity({ name: 'guild_team_role', schema: 'rotom' })
export class GuildTeamRole {
    @PrimaryColumn({ name: 'guild_id', type: 'varchar', length: 20 })
    guildId!: string;

    @PrimaryColumn({ name: 'team', type: 'varchar', length: 8 })
    team!: string;

    @Column({ name: 'role_id', type: 'varchar', length: 20 })
    roleId!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a guild team role entity. Requires primary keys and allows partial updates of other fields.
 */
export type GuildTeamRoleUpdate = Pick<GuildTeamRole, 'guildId' | 'team'> &
    Partial<Omit<GuildTeamRole, 'guildId' | 'team' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a guild team role entity. Only includes the primary keys.
 */
export type GuildTeamRoleDelete = Pick<GuildTeamRole, 'guildId' | 'team'>;
