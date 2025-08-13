
import { DrossDatabaseTable } from '@drossjs/dross-database';

class BattleMember extends DrossDatabaseTable {
    static schema = this.parseSchema({
        tableName: 'battle_member',
        orderBy: ['battle_id', 'created_at'],
        fields: {
            'battle_id':  { type: 'snowflake', nullable: false },
            'trainer_id': { type: 'snowflake', nullable: false },
            'status':     { type: 'string',    nullable: false,  length: 20 }
        },
        primaryKey: ['battle_id', 'trainer_id']
    });
    
    constructor(data) {
        super(data);
    }
    
    // *********** //
    // * Getters * //
    // *********** //
    
    get battleId  () { return this.getField('battleId'); }
    get trainerId () { return this.getField('trainerId'); }
    get status    () { return this.getField('status'); }
    
    // *********** //
    // * Setters * //
    // *********** //
    
    set battleId  (value) { this.setField('battleId', value); }
    set trainerId (value) { this.setField('trainerId', value); }
    set status    (value) { this.setField('status', value); }
    
    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    
    // ******************** //
    // * Instance Methods * //
    // ******************** //
    
    async update(conditions = {battleId: this.battleId, trainerId: this.trainerId}) {
        await DrossDatabaseTable.prototype.update.call(this, conditions);
    }
    
    async delete(conditions = {battleId: this.battleId, trainerId: this.trainerId}) {
        await DrossDatabaseTable.prototype.delete.call(this, conditions);
    }
}

export default BattleMember;
