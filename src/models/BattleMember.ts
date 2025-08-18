import {
    type DrossTableConditions,
    type DrossTableData,
    DrossDatabaseTable,
    DrossFieldType
} from '@drossjs/dross-database';

export interface BattleMemberData extends DrossTableData {
    battleId: string;
    trainerId: string;
    status: string;
}

export interface BattleMemberConditions extends DrossTableConditions {
    battleId?: string;
    trainerId?: string;
    status?: string;
}

export default class BattleMember extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'battle_member',
        orderBy: ['battle_id', 'created_at'],
        fields: {
            'battle_id':  { type: DrossFieldType.Snowflake, nullable: false },
            'trainer_id': { type: DrossFieldType.Snowflake, nullable: false },
            'status':     { type: DrossFieldType.String,    nullable: false,  length: 20 }
        },
        primaryKey: ['battle_id', 'trainer_id']
    });

    constructor(data: BattleMemberData) {
        super(data);
    }
    
    /***********
     * Getters *
     ***********/

    get battleId  (): string { return this.getField('battleId'); }
    get trainerId (): string { return this.getField('trainerId'); }
    get status    (): string { return this.getField('status'); }

    /***********
     * Setters *
     ***********/

    set battleId  (value: string) { this.setField('battleId', value); }
    set trainerId (value: string) { this.setField('trainerId', value); }
    set status    (value: string) { this.setField('status', value); }

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

    override async update(condition: BattleMemberConditions = { battle_id: this.battleId, trainer_id: this.trainerId }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: BattleMemberConditions = { battle_id: this.battleId, trainer_id: this.trainerId }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }
}