import {
    type Snowflake
} from 'discord.js';

import {
    DrossDatabaseTable,
    DrossFieldType
} from '@drossjs/dross-database';

export interface BattleMemberData {
    battleId: Snowflake;
    discordId: Snowflake;
    status: string;
}

export interface BattleMemberConditions {
    battleId?: Snowflake;
    discordId?: Snowflake;
    status?: string;
}

export class BattleMember extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'battle_member',
        orderBy: ['battle_id', 'created_at'],
        fields: {
            'battle_id':  { type: DrossFieldType.Snowflake, nullable: false },
            'discord_id': { type: DrossFieldType.Snowflake, nullable: false },
            'status':     { type: DrossFieldType.String,    nullable: false,  length: 20 }
        },
        primaryKey: ['battle_id', 'discord_id']
    });

    constructor(data: BattleMemberData) {
        super(data);
    }
    
    /***********
     * Getters *
     ***********/

    get battleId  (): Snowflake { return this.getField('battleId'); }
    get discordId (): Snowflake { return this.getField('discordId'); }
    get status    (): string    { return this.getField('status'); }

    /***********
     * Setters *
     ***********/

    set battleId  (value: Snowflake) { this.setField('battleId', value); }
    set discordId (value: Snowflake) { this.setField('discordId', value); }
    set status    (value: string)    { this.setField('status', value); }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(conditions: BattleMemberConditions = {}, orderBy = this.schema.orderBy) {
        return await super.get(conditions, orderBy) as BattleMember[];
    }

    static override async getUnique(conditions: BattleMemberConditions = {}) {
        return await super.getUnique(conditions) as BattleMember | null;
    }

    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async update(condition: BattleMemberConditions = { battleId: this.battleId, discordId: this.discordId }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: BattleMemberConditions = { battleId: this.battleId, discordId: this.discordId }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }
}

export default BattleMember;