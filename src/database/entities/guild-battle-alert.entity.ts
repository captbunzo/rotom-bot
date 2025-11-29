import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * GuildBattleAlert entity representing battle alert configuration for Discord guilds
 */
@Entity({ name: 'guild_battle_alert', schema: 'rotom' })
export class GuildBattleAlert {
    @PrimaryColumn({ name: 'id', type: 'varchar', length: 20 })
    id!: string;

    @Column({ name: 'guild_id', type: 'varchar', length: 20 })
    guildId!: string;

    @Column({ name: 'role_id', type: 'varchar', length: 20 })
    roleId!: string;

    @Column({ name: 'channel_id', type: 'varchar', length: 20, nullable: true })
    channelId: string | null;

    @Column({ name: 'boss_type', type: 'varchar', length: 10, nullable: true })
    bossType: string | null;

    @Column({ type: 'smallint', unsigned: true, nullable: true })
    tier: number | null;

    @Column({ name: 'is_mega', type: 'smallint', unsigned: true, nullable: true })
    isMega: boolean | null;

    @Column({ name: 'is_shadow', type: 'smallint', unsigned: true, nullable: true })
    isShadow: boolean | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a guild battle alert entity. Requires primary key and allows partial updates of other fields.
 */
export type GuildBattleAlertUpdate = Pick<GuildBattleAlert, 'id'> &
    Partial<Omit<GuildBattleAlert, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a guild battle alert entity. Only includes the primary key.
 */
export type GuildBattleAlertDelete = Pick<GuildBattleAlert, 'id'>;
