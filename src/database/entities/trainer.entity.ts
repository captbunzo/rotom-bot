import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Trainer entity representing a Pokémon GO trainer's profile information
 */
@Entity({ name: 'trainer', schema: 'rotom' })
export class Trainer {
    @PrimaryColumn({ name: 'discord_id', type: 'varchar', length: 20 })
    discordId!: string;

    @Column({ name: 'trainer_name', type: 'varchar', length: 32, nullable: true })
    trainerName: string | null;

    @Column({ name: 'first_name', type: 'varchar', length: 32, nullable: true })
    firstName: string | null;

    @Column({ type: 'varchar', length: 12, nullable: true })
    code: string | null;

    @Column({ type: 'int', nullable: true })
    level: number | null;

    @Column({ type: 'varchar', length: 8, nullable: true })
    team: string | null;

    @Column({ name: 'about_me', type: 'varchar', length: 255, nullable: true })
    aboutMe: string | null;

    @Column({ name: 'favorite_pokemon', type: 'varchar', length: 24, nullable: true })
    favoritePokemon: string | null;

    @CreateDateColumn({ name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt!: Date;
}

/**
 * Type for updating a trainer entity. Requires primary key and allows partial updates of other fields.
 */
export type TrainerUpdate = Pick<Trainer, 'discordId'> &
    Partial<Omit<Trainer, 'discordId' | 'createdAt' | 'updatedAt'>>;

/**
 * Type for deleting a trainer entity. Only includes the primary key.
 */
export type TrainerDelete = Pick<Trainer, 'discordId'>;
