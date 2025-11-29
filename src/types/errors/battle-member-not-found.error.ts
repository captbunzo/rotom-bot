/**
 * Error thrown when a battle member is not found
 */
export class BattleMemberNotFoundError extends Error {
    public readonly battleId: string;
    public readonly discordId: string;

    constructor(battleId: string, discordId: string) {
        super(`Battle member with battleId ${battleId} and discordId ${discordId} not found`);

        this.name = 'BattleMemberNotFoundError';
        this.battleId = battleId;
        this.discordId = discordId;
    }
}
