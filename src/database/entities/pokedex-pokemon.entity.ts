import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * PokedexPokemon entity representing a user's Pokémon collection entry
 */
@Entity({ name: 'pokedex_pokemon', schema: 'rotom' })
export class PokedexPokemon {
    @PrimaryColumn({ name: 'discord_id', type: 'varchar', length: 20 })
    discordId!: string;

    @PrimaryColumn({ name: 'pokedex_id', type: 'smallint', unsigned: true })
    pokedexId!: number;

    @Column({ type: 'varchar', length: 64, nullable: true })
    form: string | null;

    @Column({ type: 'boolean' })
    caught!: boolean;

    @Column({ type: 'boolean' })
    shiny!: boolean;

    @Column({ type: 'boolean' })
    hundo!: boolean;

    @Column({ type: 'boolean' })
    lucky!: boolean;

    @Column({ type: 'boolean' })
    xxl!: boolean;

    @Column({ type: 'boolean' })
    xxs!: boolean;

    @Column({ type: 'boolean' })
    shadow!: boolean;

    @Column({ type: 'boolean' })
    purified!: boolean;

    @Column({ type: 'varchar', length: 256, nullable: true })
    notes: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a pokédex Pokémon entity. Requires primary keys and allows partial updates of other fields.
 */
export type PokedexPokemonUpdate = Pick<PokedexPokemon, 'discordId' | 'pokedexId'> &
    Partial<Omit<PokedexPokemon, 'discordId' | 'pokedexId' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a pokédex Pokémon entity. Only includes the primary keys.
 */
export type PokedexPokemonDelete = Pick<PokedexPokemon, 'discordId' | 'pokedexId'>;
