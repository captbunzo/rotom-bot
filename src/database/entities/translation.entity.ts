import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Translation entity representing localized text translations for Pokémon GO content
 */
@Entity({ name: 'translation', schema: 'rotom' })
export class Translation {
    @PrimaryColumn({ name: 'id', type: 'varchar', length: 20 })
    id!: string;

    @Column({ type: 'varchar', length: 20 })
    name!: string;

    @Column({ type: 'smallint', unsigned: true })
    key!: number;

    @Column({ type: 'varchar', length: 10 })
    variant!: string;

    @Column({ name: 'variant_id', type: 'smallint', unsigned: true, nullable: true })
    variantId: number | null;

    @Column({ name: 'is_plural', type: 'smallint', unsigned: true })
    isPlural!: boolean;

    @Column({ type: 'varchar', length: 5 })
    language!: string;

    @Column({ type: 'varchar', length: 1024 })
    value!: string;

    @Column({ type: 'varchar', length: 100 })
    code!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a translation entity. Requires primary key and allows partial updates of other fields.
 */
export type TranslationUpdate = Pick<Translation, 'id'> &
    Partial<Omit<Translation, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a translation entity. Only includes the primary key.
 */
export type TranslationDelete = Pick<Translation, 'id'>;
