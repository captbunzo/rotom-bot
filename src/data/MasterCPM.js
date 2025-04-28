
// Load our classes
import DatabaseTable  from '../DatabaseTable.js';
import Timestamp      from '../Timestamp.js';

// Load singletons
import client from '../Client.js';

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
    
    // No custom getters required
    
    // *********** //
    // * Setters * //
    // *********** //
    
    // No custom setters required
    
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

    // ********************************** //
    // * Turn a Guardian into a Message * //
    // ********************************** //
    
    /* async getMessageContent(cachedParameters = {}) {
        const user = await this.getUser();
        
        //
        // TODO - It would be nice to figure out how to get GuildMember instead so I can get their Guild displayName
        //
        
        let details = [];
        details.push(`**Time Zone:** ${this.timezone ? this.timezone : 'Not Set'}`);
        details.push(`**Event (LFG) Privacy:** ${this.privateEventDefault ? 'Private' : 'Public'}`);
        
        return `__**${user.username}**__` + '\n' + details.join('\n');
    } */
}
