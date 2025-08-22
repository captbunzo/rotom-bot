import {
    type Snowflake,
    EmbedBuilder
} from 'discord.js';

import {
    DrossDatabaseTable,
    DrossFieldType
} from '@drossjs/dross-database';

import { PokedexEntry } from '#src/Constants.js';
import MasterPokemon from './MasterPokemon.js';

export interface PokedexPokemonData {
    discordId: Snowflake;
    pokedexId: number;
    form?: string | null | undefined;
    caught: boolean;
    shiny: boolean;
    hundo: boolean;
    lucky: boolean;
    xxl: boolean;
    xxs: boolean;
    shadow: boolean;
    purified: boolean;
    notes?: string | null | undefined;
}

export interface PokedexPokemonDataNew {
    discordId: Snowflake;
    pokedexId: number;
    form?: string | null | undefined;
}

export interface PokedexPokemonConditions {
    discordId?: Snowflake;
    pokedexId?: number;
    form?: string | null | undefined;
    caught?: boolean | null | undefined;
    shiny?: boolean | null | undefined;
    hundo?: boolean | null | undefined;
    lucky?: boolean | null | undefined;
    xxl?: boolean | null | undefined;
    xxs?: boolean | null | undefined;
    shadow?: boolean | null | undefined;
    purified?: boolean | null | undefined;
    notes?: string | null | undefined;
}

export const PokedexPokemonDefaults: Partial<PokedexPokemonData> = {
    caught: false,
    shiny: false,
    hundo: false,
    lucky: false,
    xxl: false,
    xxs: false,
    shadow: false,
    purified: false
};

export class PokedexPokemon extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'pokedex_pokemon',
        orderBy: ['discord_id', 'pokedex_id', 'form'],
        fields: {
            'discord_id': { type: DrossFieldType.Snowflake, nullable: false },
            'pokedex_id': { type: DrossFieldType.SmallInt,  nullable: false, unsigned: true },
            'form':       { type: DrossFieldType.String,    nullable: true, length: 64 },
            'caught':     { type: DrossFieldType.Boolean,   nullable: false },
            'shiny':      { type: DrossFieldType.Boolean,   nullable: false },
            'hundo':      { type: DrossFieldType.Boolean,   nullable: false },
            'lucky':      { type: DrossFieldType.Boolean,   nullable: false },
            'xxl':        { type: DrossFieldType.Boolean,   nullable: false },
            'xxs':        { type: DrossFieldType.Boolean,   nullable: false },
            'shadow':     { type: DrossFieldType.Boolean,   nullable: false },
            'purified':   { type: DrossFieldType.Boolean,   nullable: false },
            'notes':      { type: DrossFieldType.String,    nullable: true, length: 256 },
        },
        primaryKey: ['discord_id', 'pokedex_id']
    });

    constructor(data: PokedexPokemonData | PokedexPokemonDataNew) {
        const dataForNew = { ...PokedexPokemonDefaults, ...data } as PokedexPokemonData;

        if (!dataForNew.form) {
            dataForNew.form = null;
        }

        if (!dataForNew.notes) {
            dataForNew.notes = null;
        }

        super(dataForNew);
    }
    
    /***********
     * Getters *
     ***********/
    
    get discordId (): Snowflake     { return this.getField('discordId'); }
    get pokedexId (): number        { return this.getField('pokedexId'); }
    get form      (): string | null { return this.getField('form'); }
    get caught    (): boolean       { return this.getField('caught'); }
    get shiny     (): boolean       { return this.getField('shiny'); }
    get hundo     (): boolean       { return this.getField('hundo'); }
    get lucky     (): boolean       { return this.getField('lucky'); }
    get xxl       (): boolean       { return this.getField('xxl'); }
    get xxs       (): boolean       { return this.getField('xxs'); }
    get shadow    (): boolean       { return this.getField('shadow'); }
    get purified  (): boolean       { return this.getField('purified'); }
    get notes     (): string | null { return this.getField('notes'); }

    /***********
     * Setters *
     ***********/

    set discordId ( value: Snowflake     ) { this.setField('discordId', value); }
    set pokedexId ( value: number        ) { this.setField('pokedexId', value); }
    set form      ( value: string | null ) { this.setField('form', value); }
    set caught    ( value: boolean       ) { this.setField('caught', value); }
    set shiny     ( value: boolean       ) { this.setField('shiny', value); }
    set hundo     ( value: boolean       ) { this.setField('hundo', value); }
    set lucky     ( value: boolean       ) { this.setField('lucky', value); }
    set xxl       ( value: boolean       ) { this.setField('xxl', value); }
    set xxs       ( value: boolean       ) { this.setField('xxs', value); }
    set shadow    ( value: boolean       ) { this.setField('shadow', value); }
    set purified  ( value: boolean       ) { this.setField('purified', value); }
    set notes     ( value: string | null ) { this.setField('notes', value); }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(conditions: PokedexPokemonConditions = {}, orderBy = this.schema.orderBy) {
        return await super.get(conditions, orderBy) as PokedexPokemon[];
    }

    static override async getUnique(conditions: PokedexPokemonConditions = {}) {
        return await super.getUnique(conditions) as PokedexPokemon | null;
    }

    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async update(condition: PokedexPokemonConditions = {
        discordId: this.discordId,
        pokedexId: this.pokedexId,
        form: this.form
    }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: PokedexPokemonConditions = {
        discordId: this.discordId,
        pokedexId: this.pokedexId,
        form: this.form
    }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }

    /********************
     * Instance Methods *
     ********************/

    async buildEmbed(masterPokemon: MasterPokemon | null = null): Promise<EmbedBuilder> {
        let masterPokemonFound = masterPokemon;

        if (!masterPokemonFound) {
            masterPokemonFound = await MasterPokemon.getUnique({ pokedexId: this.pokedexId, form: this.form || null });
            if (!masterPokemonFound) {
                throw new Error(`Master Pokemon not found for Pokédex ID ${this.pokedexId} and form ${this.form}`);
            }
        }

        // Start building the embed
        let embed = await masterPokemonFound.buildEmbed(false);

        // Add the pokedex entries
        let pokedexEntries: string[] = [];

        if ( this.caught   ) pokedexEntries.push(PokedexEntry.Caught);
        if ( this.shiny    ) pokedexEntries.push(PokedexEntry.Shiny);
        if ( this.hundo    ) pokedexEntries.push(PokedexEntry.Hundo);
        if ( this.lucky    ) pokedexEntries.push(PokedexEntry.Lucky);
        if ( this.xxl      ) pokedexEntries.push(PokedexEntry.XXL);
        if ( this.xxs      ) pokedexEntries.push(PokedexEntry.XXS);
        if ( this.shadow   ) pokedexEntries.push(PokedexEntry.Shadow);
        if ( this.purified ) pokedexEntries.push(PokedexEntry.Purified);

        let pokedexEntryString = 'None';

        if (pokedexEntries.length > 0) {
            pokedexEntryString = pokedexEntries.join(', ');
        }

        embed = embed
            .addFields({ name: 'Pokédex Entries', value: pokedexEntryString, inline: false });
        
        if (this.notes) {
            embed = embed
                .addFields({ name: 'Pokédex Notes', value: this.notes || '', inline: false });
        }

        embed = embed
            .setTimestamp(this.updatedAt);

        return embed;
    }

    setEntry(entry: PokedexEntry, value: boolean = true) {
        switch (entry) {
            case PokedexEntry.Caught:
                this.caught = value;
                break;
            case PokedexEntry.Shiny:
                this.shiny = value;
                break;
            case PokedexEntry.Hundo:
                this.hundo = value;
                break;
            case PokedexEntry.Lucky:
                this.lucky = value;
                break;
            case PokedexEntry.XXL:
                this.xxl = value;
                break;
            case PokedexEntry.XXS:
                this.xxs = value;
                break;
            case PokedexEntry.Shadow:
                this.shadow = value;
                break;
            case PokedexEntry.Purified:
                this.purified = value;
                break;
        }
    }

    setAllEntries() {
        this.caught = true;
        this.shiny = true;
        this.hundo = true;
        this.lucky = true;
        this.xxl = true;
        this.xxs = true;
        this.shadow = true;
        this.purified = true;
    }

    clearAllEntries() {
        this.caught = false;
        this.shiny = false;
        this.hundo = false;
        this.lucky = false;
        this.xxl = false;
        this.xxs = false;
        this.shadow = false;
        this.purified = false;
    }
}

export default PokedexPokemon;