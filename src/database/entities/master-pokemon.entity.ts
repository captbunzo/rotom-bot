import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * MasterPokemon entity representing master data for all Pokémon in Pokémon GO
 */
@Entity({ name: 'master_pokemon', schema: 'rotom' })
export class MasterPokemon {
    @PrimaryColumn({ name: 'template_id', type: 'varchar', length: 64 })
    templateId!: string;

    @Column({ name: 'pokemon_id', type: 'varchar', length: 20 })
    pokemonId!: string;

    @Column({ name: 'pokedex_id', type: 'smallint', unsigned: true })
    pokedexId!: number;

    @Column({ type: 'varchar', length: 8 })
    type!: string;

    @Column({ name: 'type2', type: 'varchar', length: 8, nullable: true })
    type2: string | null;

    @Column({ type: 'varchar', length: 64, nullable: true })
    form: string | null;

    @Column({ name: 'form_master', type: 'varchar', length: 64, nullable: true })
    formMaster: string | null;

    @Column({ name: 'base_attack', type: 'smallint', unsigned: true, nullable: true })
    baseAttack: number | null;

    @Column({ name: 'base_defense', type: 'smallint', unsigned: true, nullable: true })
    baseDefense: number | null;

    @Column({ name: 'base_stamina', type: 'smallint', unsigned: true, nullable: true })
    baseStamina: number | null;

    @Column({ name: 'candy_to_evolve', type: 'smallint', unsigned: true, nullable: true })
    candyToEvolve: number | null;

    @Column({ name: 'buddy_distance_km', type: 'smallint', unsigned: true })
    buddyDistanceKm!: number;

    @Column({ name: 'purify_stardust', type: 'smallint', unsigned: true, nullable: true })
    purifyStardust: number | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a master Pokémon entity. Requires primary key and allows partial updates of other fields.
 */
export type MasterPokemonUpdate = Pick<MasterPokemon, 'templateId'> &
    Partial<Omit<MasterPokemon, 'templateId' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a master Pokémon entity. Only includes the primary key.
 */
export type MasterPokemonDelete = Pick<MasterPokemon, 'templateId'>;
