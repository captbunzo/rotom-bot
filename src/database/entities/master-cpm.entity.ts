import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * MasterCPM entity representing Pokémon GO combat power multipliers by level
 */
@Entity({ name: 'master_cpm', schema: 'rotom' })
export class MasterCPM {
    @PrimaryColumn({ name: 'level', type: 'smallint', unsigned: true })
    level!: number;

    @Column({ type: 'decimal', precision: 9, scale: 8 })
    cpm!: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a master CPM entity. Requires primary key and allows partial updates of other fields.
 */
export type MasterCPMUpdate = Pick<MasterCPM, 'level'> &
    Partial<Omit<MasterCPM, 'level' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a master CPM entity. Only includes the primary key.
 */
export type MasterCPMDelete = Pick<MasterCPM, 'level'>;
