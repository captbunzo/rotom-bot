
import DatabaseTable from '../DatabaseTable.js';

export default class BattleMember extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'battle_member',
        orderBy: ['battle_id', 'created_at'],
        fields: {
            'battle_id':  { type: 'snowflake', nullable: false },
            'trainer_id': { type: 'snowflake', nullable: false }
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
    
    // *********** //
    // * Setters * //
    // *********** //
    
    set battleId  (value) { this.setField(value, 'battleId'); }
    set trainerId (value) { this.setField(value, 'trainerId'); }
    
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
            let boss = await super.get(conditions, orderBy);
            
            //if (!trainer) {
            //    trainer = new Trainer({id: conditions.id});
            //    //await trainer.create();
            //}
            
            return boss;
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
    
    async delete(conditions = {battleId: this.battleId, trainerId: this.trainerId}) {
        await DatabaseTable.prototype.delete.call(this, conditions);
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
