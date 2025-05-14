
import client from '../Client.js';

import DatabaseTable from '../DatabaseTable.js';

export default class MasterCPM extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'master_cpm',
        orderBy: ['level'],
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
    
    /**
     * Get MasterCPM(s) based on a given set of conditions in an optional order.
     * @param {object} [conditions] The criteria for the MasterCPM(s) to retrieve
     * @param {object} [orderBy] The order in which the MasterCPM(s) will be returned
     * @returns {Promise<MasterCPM|MasterCPM[]>} The MasterCPM(s) retrieved
     */
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        if (typeof conditions == 'object' && conditions.id && conditions.unique) {
            return await super.get(conditions, orderBy);
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
    
    async update(condition = { level: this.level }) {
        await DatabaseTable.prototype.update.call(this, condition);
    }
    
    async delete(condition = { level: this.level }) {
        await DatabaseTable.prototype.delete.call(this, condition);
    }
}
