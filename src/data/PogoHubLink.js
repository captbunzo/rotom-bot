
import {
    DrossDatabase,
    DrossDatabaseTable
} from '@drossjs/dross-database';

import MasterPokemon from '#src/data/MasterPokemon.js';

// TODO - Maybe merge this and the wiki links table
class PogoHubLink extends DrossDatabaseTable {
    static schema = this.parseSchema({
        tableName: 'pogo_hub_link',
        orderBy: ['id'],
        fields: {
            'id':            { type: 'string',    nullable: false, length: 64 },
            'pokemon_id':    { type: 'string',    nullable: false, length: 20 },
            'pokedex_id':    { type: 'smallint',  nullable: false, unsigned: true },
            'is_mega':       { type: 'tinyint',   nullable: false, unsigned: true },
            'is_gigantamax': { type: 'tinyint',   nullable: false, unsigned: true },
            'page':          { type: 'string',    nullable: false, length: 128 },
            'image':         { type: 'string',    nullable: true, length: 128 },
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
     * Get PogoHubLink(s) based on a given set of conditions in an optional order.
     * @param {object} [conditions] The criteria for the PogoHubLink(s) to retrieve
     * @param {object} [orderBy] The order in which the PogoHubLink(s) will be returned
     * @returns {Promise<PogoHubLink|PogoHubLink[]>} The PogoHubLink(s) retrieved
     */
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        DrossDatabase.logger.debug(`typeof conditions = ${typeof conditions}`);
        DrossDatabase.logger.debug(`conditions.constructor.name = ${conditions.constructor.name}`);
        DrossDatabase.logger.debug(`conditions =`);
        DrossDatabase.logger.dump(conditions);

        if (typeof conditions == 'object' && conditions.constructor.name == 'Boss') {
            let boss = conditions;
            let masterPokemon = await MasterPokemon.get({ templateId: boss.templateId, unique: true });
            
            let pogoHubLinkSearchObj = null;
            let pogoHubLink = null;

            // First check for the wiki link record with the full search parameters
            pogoHubLinkSearchObj = {
                templateId: masterPokemon.templateId,
                isMega: boss.isMega,
                isGigantamax: ( boss.bossType == BossType.Gigantamax)
            };
            pogoHubLink = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLink.length == 1) {
                return pogoHubLink[0];
            }

            // Next check based on the pokemon name
            pogoHubLinkSearchObj = {
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: boss.isMega,
                isGigantamax: ( boss.bossType == BossType.Gigantamax)
            };
            pogoHubLink = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLink.length == 1) {
                return pogoHubLink[0];
            }

            // Otherwise check for the base record
            pogoHubLinkSearchObj = {
                templateId: masterPokemon.templateId,
                isMega: false,
                isGigantamax: false
            };
            pogoHubLink = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLink.length == 1) {
                return pogoHubLink[0];
            }

            // And finally check for the base record with the pokemon name
            pogoHubLinkSearchObj = {
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: false,
                isGigantamax: false
            };
            pogoHubLink = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLink.length == 1) {
                return pogoHubLink[0];
            }

            return null;
        }

        if (typeof conditions == 'object' && conditions.constructor.name == 'MasterPokemon') {
            let masterPokemon = conditions;

            let pogoHubLinkSearchObj = null;
            let pogoHubLink = null;

            // First check for the base record
            pogoHubLinkSearchObj = {
                templateId: masterPokemon.templateId,
                form: masterPokemon.form,
                isMega: false,
                isGigantamax: false
            };
            pogoHubLink = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLink.length == 1) {
                return pogoHubLink[0];
            }
            
            // Otherwise check for the base record without the form
            pogoHubLinkSearchObj = {
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: false,
                isGigantamax: false
            };

            pogoHubLink = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLink.length == 1) {
                return pogoHubLink[0];
            }

            pogoHubLinkSearchObj = {
                id: masterPokemon.pokemonId.toLowerCase(),
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: false,
                isGigantamax: false
            };

            pogoHubLink = await PogoHubLink.get(pogoHubLinkSearchObj);
            if (pogoHubLink.length == 1) {
                return pogoHubLink[0];
            }

            return null;
        }
        
        return await super.get(conditions, orderBy);
    }

    // ******************** //
    // * Instance Methods * //
    // ******************** //
        
}

export default PogoHubLink;
