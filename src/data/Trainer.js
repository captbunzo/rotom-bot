
// Load our classes
import DatabaseTable  from '../DatabaseTable.js';
import Timestamp      from '../Timestamp.js';

// Load singletons
import client from '../Client.js';

export default class Trainer extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'trainer',
        orderBy: 'name',
        fields: {
            'id':    { type: 'snowflake', nullable: false },
            'name':  { type: 'string',    nullable: false, length: 32 },
            'code':  { type: 'string',    nullable: false, length: 12 },
            'level': { type: 'integer',   nullable: true },
            'team':  { type: 'string',    nullable: true, length: 8 }
        }
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
            
            if (!trainer) {
                trainer = new Trainer({id: conditions.id});
                await trainer.create();
            }
            
            return trainer;
        }
        
        return await super.get(conditions, orderBy);
    }
    
    // ******************** //
    // * Instance Methods * //
    // ******************** //
    
    async create() {  
        // If need be, retrieve the username
        if (!this.name) {
            const user = await client.users.fetch(this.id);
            if (user) this.name = user.name;
        }
        
        // Attempt to create it
        await DatabaseTable.prototype.create.call(this);
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
