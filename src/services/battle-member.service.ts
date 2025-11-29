import { BattleMemberStatus } from '@/constants';

import { battleMemberRepository } from '@/database/repositories';

import {
    BattleMember,
    type BattleMemberUpdate,
    type BattleMemberDelete,
} from '@/database/entities/battle-member.entity';

import { Battle } from '@/database/entities/battle.entity';
import { Trainer } from '@/database/entities/trainer.entity';

import { BattleMemberNotFoundError } from '@/types/errors/battle-member-not-found.error';
import { EntityNotFoundError } from '@/types/errors/entity-not-found.error';

/**
 * Service layer for battle member-related business logic
 */
export const BattleMemberService = {
    // ===== GET METHODS =====

    /**
     * Get battle members by battle ID
     * @param battleId The battle ID
     * @returns Array of battle member entities
     */
    async getByBattleId(battleId: string): Promise<BattleMember[]> {
        return await battleMemberRepository.findBy({ battleId });
    },

    /**
     * Get battle member by battle ID and Discord ID
     * @param battleId The battle ID
     * @param discordId The Discord user ID
     * @returns BattleMember entity or null if not found
     */
    async get(battleId: string, discordId: string): Promise<BattleMember | null> {
        return await battleMemberRepository.findOneBy({ battleId, discordId });
    },

    // ===== CREATE, UPDATE, DELETE METHODS =====

    /**
     * Create a new battle member entity
     * @param battleMember The full battle member entity to create
     * @returns The created battle member entity
     */
    async create(battleMember: BattleMember): Promise<BattleMember> {
        return await battleMemberRepository.save(battleMember);
    },

    /**
     * Update an existing battle member entity
     * @param battleMember Either a full entity or partial entity with updates
     * @returns The updated battle member entity
     */
    async update(battleMember: BattleMember | BattleMemberUpdate): Promise<BattleMember | null> {
        if (battleMember instanceof BattleMember) {
            return await battleMemberRepository.save(battleMember);
        }

        const battleMemberEntity = await this.get(battleMember.battleId, battleMember.discordId);

        if (!battleMemberEntity) {
            throw new EntityNotFoundError('BattleMember', {
                battleId: battleMember.battleId,
                discordId: battleMember.discordId,
            });
        }

        // Update only the fields that exist in the partial (excluding primary keys and timestamps)
        if (battleMember.status !== undefined) {
            battleMemberEntity.status = battleMember.status;
        }

        return await battleMemberRepository.save(battleMemberEntity);
    },

    /**
     * Delete a battle member entity
     * @param battleMember Either a full entity or an object with primary keys
     */
    async delete(battleMember: BattleMember | BattleMemberDelete): Promise<void> {
        const battleMemberEntity =
            battleMember instanceof BattleMember
                ? battleMember
                : await this.get(battleMember.battleId, battleMember.discordId);

        if (!battleMemberEntity) {
            throw new EntityNotFoundError('BattleMember', {
                battleId: battleMember.battleId,
                discordId: battleMember.discordId,
            });
        }

        await battleMemberRepository.remove(battleMemberEntity);
    },

    // ===== Join and Leave Methods =====

    async joinBattle(battle: Battle, trainer: Trainer) {
        const battleMember = new BattleMember();
        battleMember.battleId = battle.id;
        battleMember.discordId = trainer.discordId;
        battleMember.status = BattleMemberStatus.Joined;
        return await this.create(battleMember);
    },

    async leaveBattle(battle: Battle, trainer: Trainer) {
        const battleMember = await this.get(battle.id, trainer.discordId);

        if (!battleMember) {
            throw new BattleMemberNotFoundError(battle.id, trainer.discordId);
        }

        await this.delete(battleMember);
    },
};
