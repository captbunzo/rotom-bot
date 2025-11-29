import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * WikiLink entity representing links to wiki pages for Pokémon information
 */
@Entity({ name: 'wiki_link', schema: 'rotom' })
export class WikiLink {
    @PrimaryColumn({ name: 'id', type: 'varchar', length: 64 })
    id!: string;

    @Column({ name: 'pokemon_id', type: 'varchar', length: 20 })
    pokemonId!: string;

    @Column({ name: 'pokedex_id', type: 'smallint', unsigned: true })
    pokedexId!: number;

    @Column({ name: 'is_mega', type: 'smallint', unsigned: true })
    isMega!: boolean;

    @Column({ name: 'is_shadow', type: 'smallint', unsigned: true })
    isShadow!: boolean;

    @Column({ name: 'is_dynamax', type: 'smallint', unsigned: true })
    isDynamax!: boolean;

    @Column({ name: 'is_gigantamax', type: 'smallint', unsigned: true })
    isGigantamax!: boolean;

    @Column({ type: 'varchar', length: 128 })
    page!: string;

    @Column({ type: 'varchar', length: 128 })
    image!: string;

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
 * Type for updating a wiki link entity. Requires primary key and allows partial updates of other fields.
 */
export type WikiLinkUpdate = Pick<WikiLink, 'id'> &
    Partial<Omit<WikiLink, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a wiki link entity. Only includes the primary key.
 */
export type WikiLinkDelete = Pick<WikiLink, 'id'>;
