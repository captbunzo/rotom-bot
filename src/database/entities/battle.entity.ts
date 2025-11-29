import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Battle entity representing a raid or gym battle event
 */
@Entity({ name: 'battle', schema: 'rotom' })
export class Battle {
    @PrimaryColumn({ name: 'id', type: 'varchar', length: 20 })
    id!: string;

    @Column({ name: 'boss_id', type: 'varchar', length: 100 })
    bossId!: string;

    @Column({ name: 'host_discord_id', type: 'varchar', length: 20 })
    hostDiscordId!: string;

    @Column({ name: 'guild_id', type: 'varchar', length: 20 })
    guildId!: string;

    @Column({ type: 'varchar', length: 20 })
    status!: string;

    @Column({ name: 'message_id', type: 'varchar', length: 20, nullable: true, unique: true })
    messageId: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a battle entity. Requires primary key and allows partial updates of other fields.
 */
export type BattleUpdate = Pick<Battle, 'id'> &
    Partial<Omit<Battle, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a battle entity. Only includes the primary key.
 */
export type BattleDelete = Pick<Battle, 'id'>;
