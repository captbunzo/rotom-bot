import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * PogoHubLink entity representing links to Pokémon Hub pages for Pokémon
 */
@Entity({ name: 'pogo_hub_link', schema: 'rotom' })
export class PogoHubLink {
    @PrimaryColumn({ name: 'id', type: 'varchar', length: 64 })
    id!: string;

    @Column({ name: 'pokemon_id', type: 'varchar', length: 20 })
    pokemonId!: string;

    @Column({ name: 'pokedex_id', type: 'smallint', unsigned: true })
    pokedexId!: number;

    @Column({ name: 'is_mega', type: 'smallint', unsigned: true })
    isMega!: boolean;

    @Column({ name: 'is_gigantamax', type: 'smallint', unsigned: true })
    isGigantamax!: boolean;

    @Column({ type: 'varchar', length: 128 })
    page!: string;

    @Column({ type: 'varchar', length: 128, nullable: true })
    image: string | null;

    @Column({ name: 'template_id', type: 'varchar', length: 64 })
    templateId!: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
    form: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a Pogo Hub link entity. Requires primary key and allows partial updates of other fields.
 */
export type PogoHubLinkUpdate = Pick<PogoHubLink, 'id'> &
    Partial<Omit<PogoHubLink, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a Pogo Hub link entity. Only includes the primary key.
 */
export type PogoHubLinkDelete = Pick<PogoHubLink, 'id'>;
