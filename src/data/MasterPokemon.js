
import client from '../Client.js';

import {
    PokemonType,
    PokemonTypeColor
} from '../Constants.js';

import DatabaseTable from '../DatabaseTable.js';

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
    
    get templateId      () { return this.getField('templateId'); }
    get pokemonId       () { return this.getField('pokemonId'); }
    get pokedexId       () { return this.getField('pokedexId'); }
    get type            () { return this.getField('type'); }
    get type2           () { return this.getField('type2'); }
    get form            () { return this.getField('form'); }
    get formMaster      () { return this.getField('formMaster'); }
    get baseAttack      () { return this.getField('baseAttack'); }
    get baseDefense     () { return this.getField('baseDefense'); }
    get baseStamina     () { return this.getField('baseStamina'); }
    get candyToEvolve   () { return this.getField('candyToEvolve'); }
    get buddyDistanceKm () { return this.getField('buddyDistanceKm'); }
    get purifyStardust  () { return this.getField('purifyStardust'); }
 
    // *********** //
    // * Setters * //
    // *********** //
    
    set templateId      (value) { this.setField(value, 'templateId'); }
    set pokemonId       (value) { this.setField(value, 'pokemonId'); }
    set pokedexId       (value) { this.setField(value, 'pokedexId'); }
    set type            (value) { this.setField(value, 'type'); }
    set type2           (value) { this.setField(value, 'type2'); }
    set form            (value) { this.setField(value, 'form'); }
    set formMaster      (value) { this.setField(value, 'formMaster'); }
    set baseAttack      (value) { this.setField(value, 'baseAttack'); }
    set baseDefense     (value) { this.setField(value, 'baseDefense'); }
    set baseStamina     (value) { this.setField(value, 'baseStamina'); }
    set candyToEvolve   (value) { this.setField(value, 'candyToEvolve'); }
    set buddyDistanceKm (value) { this.setField(value, 'buddyDistanceKm'); }
    set purifyStardust  (value) { this.setField(value, 'purifyStardust'); }

    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    static async getPokemonIdChoices(pokemonIdPrefix, conditions = {}) {
        return await this.getChoices('pokemonId', pokemonIdPrefix, conditions);
    }
    
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

    static getTypeColor(type) {
        let typeColor;

        switch (type.toUpperCase()) {
            case PokemonType.Bug      : typeColor = PokemonTypeColor.Bug;       break;
            case PokemonType.Dark     : typeColor = PokemonTypeColor.Dark;      break;
            case PokemonType.Dragon   : typeColor = PokemonTypeColor.Dragon;    break;
            case PokemonType.Electric : typeColor = PokemonTypeColor.Electric;  break;
            case PokemonType.Fairy    : typeColor = PokemonTypeColor.Fairy;     break;
            case PokemonType.Fighting : typeColor = PokemonTypeColor.Fighting;  break;
            case PokemonType.Fire     : typeColor = PokemonTypeColor.Fire;      break;
            case PokemonType.Flying   : typeColor = PokemonTypeColor.Flying;    break;
            case PokemonType.Ghost    : typeColor = PokemonTypeColor.Ghost;     break;
            case PokemonType.Grass    : typeColor = PokemonTypeColor.Grass;     break;
            case PokemonType.Ground   : typeColor = PokemonTypeColor.Ground;    break;
            case PokemonType.Ice      : typeColor = PokemonTypeColor.Ice;       break;
            case PokemonType.Normal   : typeColor = PokemonTypeColor.Normal;    break;
            case PokemonType.Poison   : typeColor = PokemonTypeColor.Poison;    break;
            case PokemonType.Psychic  : typeColor = PokemonTypeColor.Psychic;   break;
            case PokemonType.Rock     : typeColor = PokemonTypeColor.Rock;      break;
            case PokemonType.Steel    : typeColor = PokemonTypeColor.Steel;     break;
            case PokemonType.Water    : typeColor = PokemonTypeColor.Water;     break;
        }

        client.logger.debug(`type = ${type}`);
        client.logger.debug(`typeColor = ${typeColor}`);

        return typeColor;
    };

    // ******************** //
    // * Instance Methods * //
    // ******************** //
        
    async update(condition = { templateId: this.templateId }) {
        await DatabaseTable.prototype.update.call(this, condition);
    }
    
    async delete(condition = { templateId: this.templateId }) {
        await DatabaseTable.prototype.delete.call(this, condition);
    }

    getTypeColor() {
        return MasterPokemon.getTypeColor(this.type);
    }

    getType2Color() {
        if (this.type2 != null) {
            return MasterPokemon.getTypeColor(this.type2);
        }

        return null;
    }
}
