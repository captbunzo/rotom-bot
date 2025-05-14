
import client from '../Client.js';

import {
    BossType
} from '../Constants.js';

import DatabaseTable from '../DatabaseTable.js';
import MasterPokemon from './MasterPokemon.js';

export default class WikiLink extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'wiki_link',
        orderBy: ['id'],
        fields: {
            'id':            { type: 'string',    nullable: false, length: 64 },
            'pokemon_id':    { type: 'string',    nullable: false, length: 20 },
            'pokedex_id':    { type: 'smallint',  nullable: false, unsigned: true },
            'is_mega':       { type: 'tinyint',   nullable: false, unsigned: true },
            'is_shadow':     { type: 'tinyint',   nullable: false, unsigned: true },
            'is_dynamax':    { type: 'tinyint',   nullable: false, unsigned: true },
            'is_gigantamax': { type: 'tinyint',   nullable: false, unsigned: true },
            'page':          { type: 'string',    nullable: false, length: 128 },
            'image':         { type: 'string',    nullable: false, length: 128 },
            'template_id':   { type: 'string',    nullable: false, length: 64 },
            'form':          { type: 'string',    nullable: true,  length: 64 }
        },
        primaryKey: ['id']
    });
    
    constructor(data) {
        super(data);
    }
    
    // *********** //
    // * Getters * //
    // *********** //
    
    get id           () { return this.getField('id'); }
    get pokemonId    () { return this.getField('pokemonId'); }
    get pokedexId    () { return this.getField('pokedexId'); }
    get isMega       () { return this.getField('isMega'); }
    get isShadow     () { return this.getField('isShadow'); }
    get isDynamax    () { return this.getField('isDynamax'); }
    get isGigantamax () { return this.getField('isGigantamax'); }
    get page         () { return this.getField('page'); }
    get image        () { return this.getField('image'); }
    get templateId   () { return this.getField('templateId'); }
    get form         () { return this.getField('form'); }
 
    // *********** //
    // * Setters * //
    // *********** //
    
    set id           (value) { this.setField('id', value); }
    set pokemonId    (value) { this.setField('pokemonId', value); }
    set pokedexId    (value) { this.setField('pokedexId', value); }
    set isMega       (value) { this.setField('isMega', value); }
    set isShadow     (value) { this.setField('isShadow', value); }
    set isDynamax    (value) { this.setField('isDynamax', value); }
    set isGigantamax (value) { this.setField('isGigantamax', value); }
    set page         (value) { this.setField('page', value); }
    set image        (value) { this.setField('image', value); }
    set templateId   (value) { this.setField('templateId', value); }
    set form         (value) { this.setField('form', value); }

    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    static async getPokemonIdChoices(pokemonIdPrefix, conditions = {}) {
        return await this.getChoices('pokemonId', pokemonIdPrefix, conditions);
    }
        
    /**
     * Get MasterPokemon(s) based on a given set of conditions in an optional order.
     * @param {object} [conditions] The criteria for the MasterPokemon(s) to retrieve
     * @param {object} [orderBy] The order in which the MasterPokemon(s) will be returned
     * @returns {Promise<MasterPokemon|MasterPokemon[]>} The MasterPokemon(s) retrieved
     */
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        if (typeof conditions == 'object' && conditions.constructor.name == 'Boss') {
            let boss = conditions;
            let masterPokemon = await MasterPokemon.get({ templateId: boss.templateId, unique: true });
            
            let wikiLinkSearchObj = {
                templateId: masterPokemon.templateId,
                isMega: boss.isMega,
                isShadow: boss.isShadow,
                isDynamax: ( boss.bossType == BossType.Dynamax),
                isGigantamax: ( boss.bossType == BossType.Gigantamax),
                unique: true
            };

            //client.logger.debug(`wikiLinkSearchObj [A] = `);
            //client.logger.dump(wikiLinkSearchObj);

            // First check for the wiki link record with the full search parameters
            let wikiLink = await WikiLink.get(wikiLinkSearchObj);
            if (wikiLink !== null) {
                return wikiLink;
            }

            // Otherwise check for the base record
            wikiLinkSearchObj = {
                templateId: masterPokemon.templateId,
                isMega: false,
                isShadow: false,
                isDynamax: false,
                isGigantamax: false,
                unique: true
            };

            //client.logger.debug(`wikiLinkSearchObj [B] = `);
            //client.logger.dump(wikiLinkSearchObj);

            wikiLink = await WikiLink.get(wikiLinkSearchObj);
            if (wikiLink !== null) {
                return wikiLink;
            }
        }

        if (typeof conditions == 'object' && conditions.id && conditions.unique) {
            return await super.get(conditions, orderBy);
        }
        
        return await super.get(conditions, orderBy);
    }

    // ******************** //
    // * Instance Methods * //
    // ******************** //
        
}
