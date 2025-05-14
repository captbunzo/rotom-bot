
import DatabaseTable from '../DatabaseTable.js';

export default class BattleMember extends DatabaseTable {
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
    
    set battleId  (value) { this.setField(value, 'battleId'); }
    set trainerId (value) { this.setField(value, 'trainerId'); }
    set status    (value) { this.setField(value, 'status'); }
    
    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    /**
     * Get BattleMember(s) based on a given set of conditions in an optional order.
     * @param {object} [conditions] The criteria for the BattleMember(s) to retrieve
     * @param {object} [orderBy] The order in which the BattleMember(s) will be returned
     * @returns {Promise<BattleMember|BattleMember[]>} The BattleMember(s) retrieved
     */
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        if (typeof conditions == 'object' && conditions.id && conditions.unique) {
            return await super.get(conditions, orderBy);
        }
        
        return await super.get(conditions, orderBy);
    }
    
    // ******************** //
    // * Instance Methods * //
    // ******************** //
    
    async update(conditions = {battleId: this.battleId, trainerId: this.trainerId}) {
        await DatabaseTable.prototype.update.call(this, conditions);
    }
    
    async delete(conditions = {battleId: this.battleId, trainerId: this.trainerId}) {
        await DatabaseTable.prototype.delete.call(this, conditions);
    }
}
