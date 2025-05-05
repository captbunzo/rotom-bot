
import client from '../Client.js';

import DatabaseTable from '../DatabaseTable.js';

export default class MasterCPM extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'master_cpm',
        orderBy: 'level',
        fields: {
            'level': { type: 'tinyint', nullable: false, unsigned: true },
            'cpm':   { type: 'decimal', nullable: false, precision: 9, scale: 8 }
        },
        primaryKey: ['level']
    });
    
    constructor(data) {
        super(data);
    }
    
    // *********** //
    // * Getters * //
    // *********** //
    
    get level () { return this.getField('level'); }
    get cpm   () { return this.getField('cpm'); }
    
    // *********** //
    // * Setters * //
    // *********** //
    
    set level (value) { this.setField(value, 'level'); }
    set cpm   (value) { this.setField(value, 'cpm'); }
    
    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    //static parseConditions(conditions) {
    //    return conditions;
    //}
    
    /**
     * Get guardian(s) based on a given set of conditions in an optional order.
     * @param {object} [conditions] The criteria for the guardian(s) to retrieve
     * @param {object} [orderBy] The order in which the guardian(s) will be returned
     * @returns {Promise<Guardian|Guardian[]>} The guardian(s) retrieved
     */
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        if (typeof conditions == 'object' && conditions.id && conditions.unique) {
            let trainer = await super.get(conditions, orderBy);
            
            //if (!trainer) {
            //    trainer = new Trainer({id: conditions.id});
            //    //await trainer.create();
            //}
            
            return trainer;
        }
        
        return await super.get(conditions, orderBy);
    }
    
     static async getCombatPower(masterPokemonRec, attackIV, defenseIV, staminaIV, level) {
        const masterCpmRec = await MasterCPM.get({ level: level, unique: true });
        client.logger.debug('Master CP Multiplier Record');
        client.logger.dump(masterCpmRec);

        //
        // Combat Power (CP) = FLOOR(((Attack + Attack IV) * SQRT(Defense + Defense IV) * SQRT(Stamina + Stamina IV) * (CPM_AT_LEVEL(Level) ^ 2)) / 10)
        //
        
        const attackTotal  = masterPokemonRec.baseAttack  + attackIV;
        const defenseTotal = masterPokemonRec.baseDefense + defenseIV;
        const staminaTotal = masterPokemonRec.baseStamina + staminaIV;
        const cp = Math.floor(((attackTotal * Math.sqrt(defenseTotal) * Math.sqrt(staminaTotal) * Math.pow(masterCpmRec.cpm, 2)) / 10));

        return cp;
    }

    // ******************** //
    // * Instance Methods * //
    // ******************** //
    
    //async create() {  
    //    // If need be, retrieve the username
    //    if (!this.name) {
    //        const user = await client.users.fetch(this.id);
    //        if (user) this.name = user.name;
    //    }
    //    
    //    // Attempt to create it
    //    await DatabaseTable.prototype.create.call(this);
    //}
    
    async update(condition = { level: this.level }) {
        await DatabaseTable.prototype.update.call(this, condition);
    }
    
    async delete(condition = { level: this.level }) {
        await DatabaseTable.prototype.delete.call(this, condition);
    }
}
