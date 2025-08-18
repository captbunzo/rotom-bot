import {
    type DrossTableConditions,
    type DrossTableData,
    DrossDatabaseTable,
    DrossFieldType
} from '@drossjs/dross-database';

import { BossType } from '#src/Constants.js';
import Boss from '#src/models/Boss.js';
import MasterPokemon from '#src/models/MasterPokemon.js';

export interface WikiLinkData extends DrossTableData {
    id: string;
    pokemonId: string;
    pokedexId: number;
    isMega: boolean;
    isShadow: boolean;
    isDynamax: boolean;
    isGigantamax: boolean;
    page: string;
    image: string;
    templateId: string;
    form?: string | null;
}

export interface WikiLinkConditions extends DrossTableConditions {
    id?: string;
    pokemonId?: string;
    pokedexId?: number;
    isMega?: boolean;
    isShadow?: boolean;
    isDynamax?: boolean;
    isGigantamax?: boolean;
    page?: string;
    image?: string;
    templateId?: string;
    form?: string | null;
}

export default class WikiLink extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'wiki_link',
        orderBy: ['id'],
        fields: {
            'id':            { type: DrossFieldType.String,   nullable: false, length: 64 },
            'pokemon_id':    { type: DrossFieldType.String,   nullable: false, length: 20 },
            'pokedex_id':    { type: DrossFieldType.SmallInt, nullable: false, unsigned: true },
            'is_mega':       { type: DrossFieldType.TinyInt,  nullable: false, unsigned: true },
            'is_shadow':     { type: DrossFieldType.TinyInt,  nullable: false, unsigned: true },
            'is_dynamax':    { type: DrossFieldType.TinyInt,  nullable: false, unsigned: true },
            'is_gigantamax': { type: DrossFieldType.TinyInt,  nullable: false, unsigned: true },
            'page':          { type: DrossFieldType.String,   nullable: false, length: 128 },
            'image':         { type: DrossFieldType.String,   nullable: false, length: 128 },
            'template_id':   { type: DrossFieldType.String,   nullable: false, length: 64 },
            'form':          { type: DrossFieldType.String,   nullable: true,  length: 64 }
        },
        primaryKey: ['id']
    });

    constructor(data: WikiLinkData) {
        super(data);
    }
    
    /***********
     * Getters *
     ***********/
    
    get id           (): string        { return this.getField('id'); }
    get pokemonId    (): string        { return this.getField('pokemonId'); }
    get pokedexId    (): number        { return this.getField('pokedexId'); }
    get isMega       (): boolean       { return this.getField('isMega'); }
    get isShadow     (): boolean       { return this.getField('isShadow'); }
    get isDynamax    (): boolean       { return this.getField('isDynamax'); }
    get isGigantamax (): boolean       { return this.getField('isGigantamax'); }
    get page         (): string        { return this.getField('page'); }
    get image        (): string        { return this.getField('image'); }
    get templateId   (): string        { return this.getField('templateId'); }
    get form         (): string | null { return this.getField('form'); }
 
    /***********
     * Setters *
     ***********/
    
    set id           (value: string       ) { this.setField('id', value); }
    set pokemonId    (value: string       ) { this.setField('pokemonId', value); }
    set pokedexId    (value: number       ) { this.setField('pokedexId', value); }
    set isMega       (value: boolean      ) { this.setField('isMega', value); }
    set isShadow     (value: boolean      ) { this.setField('isShadow', value); }
    set isDynamax    (value: boolean      ) { this.setField('isDynamax', value); }
    set isGigantamax (value: boolean      ) { this.setField('isGigantamax', value); }
    set page         (value: string       ) { this.setField('page', value); }
    set image        (value: string       ) { this.setField('image', value); }
    set templateId   (value: string       ) { this.setField('templateId', value); }
    set form         (value: string | null) { this.setField('form', value); }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(conditions: WikiLinkConditions = {}, orderBy = this.schema.orderBy) {
        return await super.get(conditions, orderBy) as WikiLink[];
    }

    static override async getUnique(conditions: WikiLinkConditions = {}, orderBy = this.schema.orderBy) {
        this.database.logger.debug(`typeof conditions = ${typeof conditions}`);
        this.database.logger.debug(`conditions.constructor.name = ${conditions.constructor.name}`);
        this.database.logger.debug(`conditions =`);
        this.database.logger.dump(conditions);

        if (typeof conditions == 'object' && conditions.constructor.name == 'Boss') {
            let boss: Boss = conditions as Boss;
            let masterPokemon = await MasterPokemon.getUnique({ templateId: boss.templateId });

            if (!masterPokemon) {
                throw new Error(`MasterPokemon not found for templateId: ${boss.templateId}`);
            }

            let wikiLinkSearchObj: WikiLinkConditions | null = null;
            let wikiLinks: WikiLink[];

            // First check for the wiki link record with the full search parameters
            wikiLinkSearchObj = {
                templateId: masterPokemon.templateId,
                isMega: boss.isMega,
                isShadow: boss.isShadow,
                isDynamax: ( boss.bossType == BossType.Dynamax),
                isGigantamax: ( boss.bossType == BossType.Gigantamax)
            };
            wikiLinks = await WikiLink.get(wikiLinkSearchObj);
            if (wikiLinks.length == 1) {
                return wikiLinks[0];
            }

            // Next check based on the pokemon name
            wikiLinkSearchObj = {
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: boss.isMega,
                isShadow: boss.isShadow,
                isDynamax: ( boss.bossType == BossType.Dynamax),
                isGigantamax: ( boss.bossType == BossType.Gigantamax)
            };
            wikiLinks = await WikiLink.get(wikiLinkSearchObj);
            if (wikiLinks.length == 1) {
                return wikiLinks[0];
            }

            // Otherwise check for the base record
            wikiLinkSearchObj = {
                templateId: masterPokemon.templateId,
                isMega: false,
                isShadow: false,
                isDynamax: false,
                isGigantamax: false
            };
            wikiLinks = await WikiLink.get(wikiLinkSearchObj);
            if (wikiLinks.length == 1) {
                return wikiLinks[0];
            }

            // And finally check for the base record with the pokemon name
            wikiLinkSearchObj = {
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: false,
                isShadow: false,
                isDynamax: false,
                isGigantamax: false
            };
            wikiLinks = await WikiLink.get(wikiLinkSearchObj);
            if (wikiLinks.length == 1) {
                return wikiLinks[0];
            }

            return;
        }

        if (typeof conditions == 'object' && conditions.constructor.name == 'MasterPokemon') {
            let masterPokemon: MasterPokemon = conditions as MasterPokemon;

            let wikiLinkSearchObj: WikiLinkConditions | null = null;
            let wikiLinks: WikiLink[];

            // First check for the base record
            wikiLinkSearchObj = {
                templateId: masterPokemon.templateId,
                form: masterPokemon.form,
                isMega: false,
                isShadow: false,
                isDynamax: false,
                isGigantamax: false
            };
            wikiLinks = await WikiLink.get(wikiLinkSearchObj);
            if (wikiLinks.length == 1) {
                return wikiLinks[0];
            }
            
            // Otherwise check for the base record without the form
            wikiLinkSearchObj = {
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: false,
                isShadow: false,
                isDynamax: false,
                isGigantamax: false
            };

            wikiLinks = await WikiLink.get(wikiLinkSearchObj);
            if (wikiLinks.length == 1) {
                return wikiLinks[0];
            }

            wikiLinkSearchObj = {
                id: masterPokemon.pokemonId.toLowerCase(),
                pokemonId: masterPokemon.pokemonId,
                form: null,
                isMega: false,
                isShadow: false,
                isDynamax: false,
                isGigantamax: false
            };

            wikiLinks = await WikiLink.get(wikiLinkSearchObj);
            if (wikiLinks.length == 1) {
                return wikiLinks[0];
            }

            return;
        }
        
        return await super.getUnique(conditions, orderBy) as WikiLink;
    }

    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async update(condition: WikiLinkConditions = { id: this.id }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: WikiLinkConditions = { id: this.id }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }

    /*****************
     * Class Methods *
     *****************/
    
    static async getPokemonIdChoices(pokemonIdPrefix: string, conditions: WikiLinkConditions = {}) {
        return await this.getChoices('pokemonId', pokemonIdPrefix, conditions);
    }
}