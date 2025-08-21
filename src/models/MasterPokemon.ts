import { EmbedBuilder } from 'discord.js';

import {
    DrossDatabaseTable,
    DrossFieldType
} from '@drossjs/dross-database';

import {
    PokemonType,
    PokemonTypeColor
} from '#src/Constants.js';

import StringFunctions from '#src/functions/StringFunctions.js';

import MasterCPM   from '#src/models/MasterCPM.js';
import PogoHubLink from '#src/models/PogoHubLink.js';
import Translation from '#src/models/Translation.js';
import WikiLink    from '#src/models/WikiLink.js';

export interface MasterPokemonData {
    templateId: string;
    pokemonId: string;
    pokedexId: number;
    type: string;
    type2?: string | null | undefined;
    form?: string | null | undefined;
    formMaster?: string | null | undefined;
    baseAttack?: number | null | undefined;
    baseDefense?: number | null | undefined;
    baseStamina?: number | null | undefined;
    candyToEvolve?: number | null | undefined;
    buddyDistanceKm: number;
    purifyStardust?: number | null | undefined;
}

export interface MasterPokemonConditions {
    templateId?: string;
    pokemonId?: string;
    pokedexId?: number;
    type?: string;
    type2?: string | null | undefined;
    form?: string | null | undefined;
    formMaster?: string | null | undefined;
    baseAttack?: number | null | undefined;
    baseDefense?: number | null | undefined;
    baseStamina?: number | null | undefined;
    candyToEvolve?: number | null | undefined;
    buddyDistanceKm?: number;
    purifyStardust?: number | null | undefined;
}

export class MasterPokemon extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'master_pokemon',
        orderBy: ['template_id'],
        fields: {
            'template_id':       { type: DrossFieldType.String,   nullable: false, length: 64 },
            'pokemon_id':        { type: DrossFieldType.String,   nullable: false, length: 20 },
            'pokedex_id':        { type: DrossFieldType.SmallInt, nullable: false, unsigned: true },
            'type':              { type: DrossFieldType.String,   nullable: false, length: 8  },
            'type2':             { type: DrossFieldType.String,   nullable: true,  length: 8  },
            'form':              { type: DrossFieldType.String,   nullable: true,  length: 64 },
            'form_master':       { type: DrossFieldType.String,   nullable: true,  length: 64 },
            'base_attack':       { type: DrossFieldType.SmallInt, nullable: true,  unsigned: true },
            'base_defense':      { type: DrossFieldType.SmallInt, nullable: true,  unsigned: true },
            'base_stamina':      { type: DrossFieldType.SmallInt, nullable: true,  unsigned: true },
            'candy_to_evolve':   { type: DrossFieldType.SmallInt, nullable: true,  unsigned: true },
            'buddy_distance_km': { type: DrossFieldType.TinyInt,  nullable: false, unsigned: true },
            'purify_stardust':   { type: DrossFieldType.SmallInt, nullable: true,  unsigned: true }
        },
        primaryKey: ['template_id']
    });
    
    constructor(data: MasterPokemonData) {
        super(data);
    }
    
    /***********
     * Getters *
     ***********/
    
    get templateId      (): string        { return this.getField('templateId'); }
    get pokemonId       (): string        { return this.getField('pokemonId'); }
    get pokedexId       (): number        { return this.getField('pokedexId'); }
    get type            (): string        { return this.getField('type'); }
    get type2           (): string | null { return this.getField('type2'); }
    get form            (): string | null { return this.getField('form'); }
    get formMaster      (): string | null { return this.getField('formMaster'); }
    get baseAttack      (): number | null { return this.getField('baseAttack'); }
    get baseDefense     (): number | null { return this.getField('baseDefense'); }
    get baseStamina     (): number | null { return this.getField('baseStamina'); }
    get candyToEvolve   (): number | null { return this.getField('candyToEvolve'); }
    get buddyDistanceKm (): number        { return this.getField('buddyDistanceKm'); }
    get purifyStardust  (): number | null { return this.getField('purifyStardust'); }

    /***********
     * Setters *
     ***********/
    
    set templateId      ( value: string        ) { this.setField('templateId', value); }
    set pokemonId       ( value: string        ) { this.setField('pokemonId', value); }
    set pokedexId       ( value: number        ) { this.setField('pokedexId', value); }
    set type            ( value: string        ) { this.setField('type', value); }
    set type2           ( value: string | null ) { this.setField('type2', value); }
    set form            ( value: string | null ) { this.setField('form', value); }
    set formMaster      ( value: string | null ) { this.setField('formMaster', value); }
    set baseAttack      ( value: number | null ) { this.setField('baseAttack', value); }
    set baseDefense     ( value: number | null ) { this.setField('baseDefense', value); }
    set baseStamina     ( value: number | null ) { this.setField('baseStamina', value); }
    set candyToEvolve   ( value: number | null ) { this.setField('candyToEvolve', value); }
    set buddyDistanceKm ( value: number        ) { this.setField('buddyDistanceKm', value); }
    set purifyStardust  ( value: number | null ) { this.setField('purifyStardust', value); }

    /**************************
     * Class Method Overrides *
     **************************/

    static override async get(conditions: MasterPokemonConditions = {}, orderBy = this.schema.orderBy) {
        return await super.get(conditions, orderBy) as MasterPokemon[];
    }

    static override async getUnique(conditions: MasterPokemonConditions = {}) {
        return await super.getUnique(conditions) as MasterPokemon | null;
    }

    /*****************************
     * Instance Method Overrides *
     *****************************/

    override async update(condition: MasterPokemonConditions = { templateId: this.templateId }) {
        await DrossDatabaseTable.prototype.update.call(this, condition);
    }

    override async delete(condition: MasterPokemonConditions = { templateId: this.templateId }) {
        await DrossDatabaseTable.prototype.delete.call(this, condition);
    }

    /*****************
     * Class Methods *
     *****************/

    static async getPokemonIdChoices(pokemonIdPrefix: string, conditions: MasterPokemonConditions = {}) {
        return await this.getChoices('pokemonId', pokemonIdPrefix, conditions);
    }

    static async getTemplateIdChoices(templateIdPrefix: string, conditions: MasterPokemonConditions = {}) {
        return await this.getChoices('templateId', templateIdPrefix, conditions);
    }

    static async getFormChoices(formPrefix: string, conditions: MasterPokemonConditions = {}) {
        return await this.getChoices('form', formPrefix, conditions);
    }

    static getTypeColor(type: string): number {
        let typeColor: number | undefined;

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

        if (!typeColor) {
            throw new Error(`Unknown Pokémon type: ${type}`);
        }

        this.database.logger.debug(`type = ${type}`);
        this.database.logger.debug(`typeColor = ${typeColor}`);

        return typeColor;
    };

    /*******************
     * Instance Methods *
     ********************/
        
    async getName(language = Translation.Language.English) {
        return await Translation.getPokemonName(this.pokedexId, language);
    }

    async getDescription(language = Translation.Language.English) {
        return await Translation.getPokemonDescription(this.pokedexId, language);
    }

    async getTypeName(language = Translation.Language.English) {
        return await Translation.getPokemonType(this.type, language);
    }

    async getType2Name(language = Translation.Language.English) {
        if (this.type2 != null) {
            return await Translation.getPokemonType(this.type2, language);
        }
        return null;
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

    async getCombatPower(attack: number, defense: number, stamina: number, level: number) {
        return await MasterCPM.getCombatPower(this, attack, defense, stamina, level);
    }

    async getHundoCombatPower(level: number) {
        return await MasterCPM.getCombatPower(this, 15, 15, 15, level);
    }

    async buildEmbed(full: boolean = true): Promise<EmbedBuilder> {
        let title = `#${this.pokedexId} - ${await this.getName()}`;

        if (this.form !== null) {
            title += ` (${StringFunctions.titleCase(this.form)})`;
        }
        
        const description = await this.getDescription() ?? 'Description not available';
        const wikiLink = await WikiLink.getUnique(this);
        const pogoHubLink = await PogoHubLink.getUnique(this);

        this.database.logger.debug(`Wiki Link Record =`);
        this.database.logger.dump(wikiLink);

        this.database.logger.debug(`PogoHub Link Record =`);
        this.database.logger.dump(pogoHubLink);

        let link = null;
        let thumbnail = null;

        if (wikiLink) {
            link = wikiLink.page;
            thumbnail = wikiLink.image;
        }
        
        if (pogoHubLink) {
            link = pogoHubLink.page;
        }

        let typeColor = this.getTypeColor();
        let pokemonType = await this.getTypeName();

        if (this.type2 != null) {
            pokemonType += ` / ${await this.getType2Name()}`;
        }

        let pokemonForm = this.form != null ? StringFunctions.titleCase(this.form) : 'No Form';

        if (!pokemonType) {
            throw new Error(`Unknown Pokémon type: ${this.type}`);
        }

        if (!pokemonForm) {
            throw new Error(`Unknown Pokémon form: ${this.form}`);
        }

        this.database.logger.debug(`link = ${link}`);
        this.database.logger.debug(`thumbnail = ${thumbnail}`);
        this.database.logger.debug(`pokemonType = ${pokemonType}`);
        this.database.logger.debug(`pokemonForm = ${pokemonForm}`);
        this.database.logger.debug(`typeColor = ${typeColor}`);

        let embed =  new EmbedBuilder()
            .setColor(typeColor)
            .setTitle(title)
            .setURL(link)
            .setThumbnail(thumbnail);
        
        if (full) {
            embed = embed.setDescription(description);
        }
        
        embed = embed
            .addFields(
                { name: 'Pokémon Type', value: pokemonType, inline: true },
                { name: 'Pokémon Form', value: pokemonForm, inline: true }
            );
 
        /*
        const baseAttack = this.baseAttack !== null ? this.baseAttack.toString() : 'N/A';
        const baseDefense = this.baseDefense !== null ? this.baseDefense.toString() : 'N/A';
        const baseStamina = this.baseStamina !== null ? this.baseStamina.toString() : 'N/A';
        
        embed = embed
            .addFields(
                { name: 'Base Attack', value: baseAttack, inline: true },
                { name: 'Base Defense', value: baseDefense, inline: true },
                { name: 'Base Stamina', value: baseStamina, inline: true }
            );
        */
        
        if (full) {
            const candyToEvolve = this.candyToEvolve ? this.candyToEvolve.toString() : 'Does not evolve';
            const buddyDistanceKm = this.buddyDistanceKm ? `${this.buddyDistanceKm.toString()} km` : 'Unknown';
            const purifyStardust = this.purifyStardust ? this.purifyStardust.toLocaleString() : 'Unknown';

            embed = embed
                .addFields(
                    { name: 'Candy to Evolve', value: candyToEvolve, inline: true },
                    { name: 'Buddy Distance', value: buddyDistanceKm, inline: true },
                    { name: 'Purification Stardust', value: purifyStardust, inline: true }
                );
        }

        return embed;
    }
}

export default MasterPokemon;