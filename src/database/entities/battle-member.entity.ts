import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * BattleMember entity representing a user's participation in a battle
 */
@Entity({ name: 'battle_member', schema: 'rotom' })
export class BattleMember {
    @PrimaryColumn({ name: 'battle_id', type: 'varchar', length: 20 })
    battleId!: string;

    @PrimaryColumn({ name: 'discord_id', type: 'varchar', length: 20 })
    discordId!: string;

    @Column({ type: 'varchar', length: 20 })
    status!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a battle member entity. Requires primary keys and allows partial updates of other fields.
 */
export type BattleMemberUpdate = Pick<BattleMember, 'battleId' | 'discordId'> &
    Partial<Omit<BattleMember, 'battleId' | 'discordId' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a battle member entity. Only includes the primary keys.
 */
export type BattleMemberDelete = Pick<BattleMember, 'battleId' | 'discordId'>;
