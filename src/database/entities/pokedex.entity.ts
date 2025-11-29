import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Pokedex entity representing user's pokedex settings
 */
@Entity({ name: 'pokedex', schema: 'rotom' })
export class Pokedex {
    @PrimaryColumn({ name: 'discord_id', type: 'varchar', length: 20 })
    discordId!: string;

    @Column({ name: 'is_private', type: 'boolean' })
    isPrivate!: boolean;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a pokedex entity. Requires primary key and allows partial updates of other fields.
 */
export type PokedexUpdate = Pick<Pokedex, 'discordId'> &
    Partial<Omit<Pokedex, 'discordId' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a pokedex entity. Only includes the primary key.
 */
export type PokedexDelete = Pick<Pokedex, 'discordId'>;
