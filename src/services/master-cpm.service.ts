import { masterCPMRepository } from '@/database/repositories';
import {
    MasterCPM,
    type MasterCPMUpdate,
    type MasterCPMDelete,
} from '@/database/entities/master-cpm.entity.js';
import { MasterPokemon } from '@/database/entities/master-pokemon.entity.js';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';

/**
 * Service layer for master CPM-related business logic
 */
export const MasterCPMService = {
    // ===== GET METHODS =====

    /**
     * Get master CPM by level
     * @param level The pokémon level
     * @returns MasterCPM entity or null if not found
     */
    async get(level: number): Promise<MasterCPM | null> {
        return await masterCPMRepository.findOneBy({ level });
    },

    /**
     * Get all master CPM entries
     * @returns Array of all master CPM entities
     */
    async getAll(): Promise<MasterCPM[]> {
        return await masterCPMRepository.find({ order: { level: 'ASC' } });
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new master CPM entity
     * @param masterCpm The full master CPM entity to create
     * @returns The created master CPM entity
     */
    async create(masterCpm: MasterCPM): Promise<MasterCPM> {
        return await masterCPMRepository.save(masterCpm);
    },

    /**
     * Update an existing master CPM entity
     * @param masterCpm Either a full entity or partial entity with updates
     * @returns The updated master CPM entity
     */
    async update(masterCpm: MasterCPM | MasterCPMUpdate): Promise<MasterCPM | null> {
        if (masterCpm instanceof MasterCPM) {
            return await masterCPMRepository.save(masterCpm);
        }

        const masterCpmEntity = await this.get(masterCpm.level);

        if (!masterCpmEntity) {
            throw new EntityNotFoundError('MasterCPM', masterCpm.level);
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (masterCpm.cpm !== undefined) {
            masterCpmEntity.cpm = masterCpm.cpm;
        }

        return await masterCPMRepository.save(masterCpmEntity);
    },

    /**
     * Delete a master CPM entity
     * @param masterCpm Either a full entity or an object with primary keys
     */
    async delete(masterCpm: MasterCPM | MasterCPMDelete): Promise<void> {
        const masterCpmEntity =
            masterCpm instanceof MasterCPM ? masterCpm : await this.get(masterCpm.level);

        if (!masterCpmEntity) {
            throw new EntityNotFoundError('MasterCPM', masterCpm.level);
        }

        await masterCPMRepository.remove(masterCpmEntity);
    },

    // ===== HELPER / CALCULATION METHODS =====

    /**
     * Calculate combat power for a Pokémon with specific IVs and level
     *
     * Formula: CP = FLOOR(((Attack + Attack IV) * SQRT(Defense + Defense IV) * SQRT(Stamina + Stamina IV) * (CPM ^ 2)) / 10)
     *
     * @param masterPokemon The master pokémon entity
     * @param attackIV Attack IV (0-15)
     * @param defenseIV Defense IV (0-15)
     * @param staminaIV Stamina IV (0-15)
     * @param level Pokémon level
     * @returns The calculated combat power
     */
    async getCombatPower(
        masterPokemon: MasterPokemon,
        attackIV: number,
        defenseIV: number,
        staminaIV: number,
        level: number
    ): Promise<number> {
        const masterCPM = await this.get(level);

        if (!masterCPM) {
            throw new Error(`MasterCPM with level ${level} not found`);
        }

        if (!masterPokemon.baseAttack) {
            throw new Error(
                `MasterPokemon with templateId ${masterPokemon.templateId} does not have a baseAttack value`
            );
        }

        if (!masterPokemon.baseDefense) {
            throw new Error(
                `MasterPokemon with templateId ${masterPokemon.templateId} does not have a baseDefense value`
            );
        }

        if (!masterPokemon.baseStamina) {
            throw new Error(
                `MasterPokemon with templateId ${masterPokemon.templateId} does not have a baseStamina value`
            );
        }

        const attackTotal = masterPokemon.baseAttack + attackIV;
        const defenseTotal = masterPokemon.baseDefense + defenseIV;
        const staminaTotal = masterPokemon.baseStamina + staminaIV;
        const cp = Math.floor(
            (attackTotal *
                Math.sqrt(defenseTotal) *
                Math.sqrt(staminaTotal) *
                Math.pow(masterCPM.cpm, 2)) /
                10
        );

        return cp;
    },
};
