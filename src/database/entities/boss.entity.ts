import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Boss entity representing a raid or gym boss in Pokémon GO
 */
@Entity({ name: 'boss', schema: 'rotom' })
export class Boss {
    @PrimaryColumn({ name: 'id', type: 'varchar', length: 64 })
    id!: string;

    @Column({ name: 'boss_type', type: 'varchar', length: 10 })
    bossType!: string;

    @Column({ name: 'pokemon_id', type: 'varchar', length: 20 })
    pokemonId!: string;

    @Column({ type: 'varchar', length: 64, nullable: true })
    form: string | null;

    @Column({ type: 'smallint', unsigned: true })
    tier!: number;

    @Column({ name: 'is_mega', type: 'boolean', unsigned: true })
    isMega!: boolean;

    @Column({ name: 'is_shadow', type: 'boolean', unsigned: true })
    isShadow!: boolean;

    @Column({ name: 'is_active', type: 'boolean', unsigned: true })
    isActive!: boolean;

    @Column({ name: 'is_shinyable', type: 'boolean', unsigned: true })
    isShinyable!: boolean;

    @Column({ name: 'template_id', type: 'varchar', length: 64 })
    templateId!: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a boss entity. Requires primary key and allows partial updates of other fields.
 */
export type BossUpdate = Pick<Boss, 'id'> & Partial<Omit<Boss, 'id' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a boss entity. Only includes the primary key.
 */
export type BossDelete = Pick<Boss, 'id'>;
