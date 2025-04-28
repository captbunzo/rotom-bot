
// Load our classes
import DatabaseTable  from '../DatabaseTable.js';
import Timestamp      from '../Timestamp.js';

// Load singletons
import client from '../Client.js';

export default class MasterPokemon extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'master_pokemon',
        orderBy: 'template_id',
        fields: {
            'template_id':       { type: 'string',    nullable: false, length: 64 },
            'pokemon_id':        { type: 'string',    nullable: false, length: 20 },
            'pokedex_id':        { type: 'smallint',  nullable: false, unsigned: true },
            'type':              { type: 'string',    nullable: false, length: 8  },
            'type2':             { type: 'string',    nullable: true,  length: 8  },
            'form':              { type: 'string',    nullable: true,  length: 64 },
            'form_master':       { type: 'string',    nullable: true,  length: 64 },
            'base_attack':       { type: 'smallint',  nullable: true,  unsigned: true },
            'base_defense':      { type: 'smallint',  nullable: true,  unsigned: true },
            'base_stamina':      { type: 'smallint',  nullable: true,  unsigned: true },
            'candy_to_evolve':   { type: 'smallint',  nullable: true,  unsigned: true },
            'buddy_distance_km': { type: 'tinyint',   nullable: false, unsigned: true },
            'purify_stardust':   { type: 'smallint',  nullable: true,  unsigned: true }
        },
        primaryKey: ['template_id']
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
            let masterPokemon = await super.get(conditions, likeConditions, orderBy);
            
            //if (!trainer) {
            //    trainer = new Trainer({id: conditions.id});
            //    //await trainer.create();
            //}
            
            return masterPokemon;
        }
        
        return await super.get(conditions, orderBy);
    }

    static async getTemplateIdChoices(templateIdPrefix, conditions = {}) {
        return await this.getChoices('templateId', templateIdPrefix, conditions);
    }

    static async getPokemonIdChoices(pokemonIdPrefix, conditions = {}) {
        return await this.getChoices('pokemonId', pokemonIdPrefix, conditions);
    }

    static async getFormChoices(formPrefix, conditions = {}) {
        return await this.getChoices('form', formPrefix, conditions);
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
    
    async update(condition = { template_id: this.templateId }) {
        await DatabaseTable.prototype.update.call(this, condition);
    }
    
    async delete(condition = { template_id: this.templateId }) {
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
