

import client from '../Client.js';

import {
    SnowflakeUtil
} from 'discord.js';

import {
    BossType,
    PokemonType
} from '../Constants.js';

import DatabaseTable from '../DatabaseTable.js';

export default class Translation extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'translation',
        orderBy: ['name', 'key', 'variant', 'is_plural', 'language'],
        fields: {
            'id':         { type: 'snowflake', nullable: false },
            'name':       { type: 'string',    nullable: false, length: 20 },
            'key':        { type: 'smallint',  nullable: false, unsigned: true },
            'variant':    { type: 'string',    nullable: false, length: 10 },
            'variant_id': { type: 'smallint',  nullable: true,  unsigned: true },
            'is_plural':  { type: 'tinyint',   nullable: false, unsigned: true },
            'language':   { type: 'string',    nullable: false, length: 5 },
            'value':      { type: 'string',    nullable: false, length: 1024 },
            'code':       { type: 'string',    nullable: false, length: 100 }
        },
        primaryKey: ['id'],
        secondaryKey: ['name', 'key', 'variant', 'is_plural', 'language']
    });
    
    constructor(data) {
        super(data);
    }
    
    /*************/
    /* Constants */
    /*************/

    static VariantNull = '-';
    static ValueBlank = '-';

    static TranslationName = {
        Pokemon: 'poke',
        PokemonDescription: 'desc',
        PokemonType: 'poke_type'
    }

    static Language = {
        ChineseTaiwan: 'zh-tw',
        BrazilianPortuguese: 'pt-br',
        English: 'en',
        French: 'fr',
        German: 'de',
        Hindi: 'hi',
        Indonesian: 'id',
        Italian: 'it',
        Japanese: 'ja',
        Korean: 'ko',
        Polish: 'pl',
        Russian: 'ru',
        Spanish: 'es',
        Swedish: 'sv',
        Thai: 'th',
        Turkish: 'tr'
    }

    static DefaultLanguage = this.Language.English;

    static LanguageName = {
        BrazilianPortuguese: 'Portuguese (Brazil)',
        ChineseTaiwan: 'Chinese (Taiwan)',
        English: 'English',
        French: 'French',
        German: 'German',
        Hindi: 'Hindi',
        Indonesian: 'Indonesian',
        Italian: 'Italian',
        Japanese: 'Japanese',
        Korean: 'Korean',
        Polish: 'Polish',
        Russian: 'Russian',
        Spanish: 'Spanish',
        Swedish: 'Swedish',
        Thai: 'Thai',
        Turkish: 'Turkish'
    }

    static LanguageChoices = [
        { name: this.LanguageName.ChineseTaiwan,       value: this.Language.ChineseTaiwan },
        { name: this.LanguageName.BrazilianPortuguese, value: this.Language.BrazilianPortuguese },
        { name: this.LanguageName.English,             value: this.Language.English },
        { name: this.LanguageName.French,              value: this.Language.French },
        { name: this.LanguageName.German,              value: this.Language.German },
        { name: this.LanguageName.Hindi,               value: this.Language.Hindi },
        { name: this.LanguageName.Indonesian,          value: this.Language.Indonesian },
        { name: this.LanguageName.Italian,             value: this.Language.Italian },
        { name: this.LanguageName.Japanese,            value: this.Language.Japanese },
        { name: this.LanguageName.Korean,              value: this.Language.Korean },
        { name: this.LanguageName.Polish,              value: this.Language.Polish },
        { name: this.LanguageName.Russian,             value: this.Language.Russian },
        { name: this.LanguageName.Spanish,             value: this.Language.Spanish },
        { name: this.LanguageName.Swedish,             value: this.Language.Swedish },
        { name: this.LanguageName.Thai,                value: this.Language.Thai },
        { name: this.LanguageName.Turkish,             value: this.Language.Turkish }
    ];

    static PokemonTypeKey = {
        Normal:   1,
        Fighting: 2,
        Flying:   3,
        Poison:   4,
        Ground:   5,
        Rock:     6,
        Bug:      7,
        Ghost:    8,
        Steel:    9,
        Fire:     10,
        Water:    11,
        Grass:    12,
        Electric: 13,
        Psychic:  14,
        Ice:      15,
        Dragon:   16,
        Dark:     17,
        Fairy:    18
    }

    static BossTypeName = {
        Raid:       'Raid',
        Dynamax:    'Dynamax',
        Gigantamax: 'Gigantamax'
    }

    static BattleTypeName = {
        Raid:       'Raid',
        Dynamax:    'Dynamax Battle',
        Gigantamax: 'Gigantamax Battle'
    }

    static MegaName   = 'Mega';
    static ShadowName = 'Shadow';

    // *********** //
    // * Getters * //
    // *********** //
    
    get id        () { return this.getField('id'); }
    get name      () { return this.getField('name'); }
    get key       () { return this.getField('key') };
    get variant   () { return this.getField('variant'); }
    get variantId () { return this.getField('variantId'); }
    get isPlural  () { return this.getField('isPlural') };
    get language  () { return this.getField('language'); }
    get value     () { return this.getField('value'); }
    get code      () { return this.getField('code'); }
  
    // *********** //
    // * Setters * //
    // *********** //
    
    set id        (value) { this.setField('id', value); }
    set name      (value) { this.setField('name', value); }
    set key       (value) { this.setField('key', value); }
    set variant   (value) { this.setField('variant', value); }
    set variantId (value) { this.setField('variantId', value); }
    set isPlural  (value) { this.setField('isPlural', value); }
    set language  (value) { this.setField('language', value); }
    set value     (value) { this.setField('value', value); }
    set code      (value) { this.setField('code', value); }
  
    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    static getBossTypeName(bossType, language = Translation.Language.English) {
        switch (bossType) {
            case BossType.Raid: return this.BossTypeName.Raid;
            case BossType.Dynamax: return this.BossTypeName.Dynamax;
            case BossType.Gigantamax: return this.BossTypeName.Gigantamax;
            default: throw new Error(`Invalid boss type: ${bossType}`);
        }
    }

    static getBattleTypeName(bossType, language = Translation.Language.English) {
        switch (bossType) {
            case BossType.Raid: return this.BattleTypeName.Raid;
            case BossType.Dynamax: return this.BattleTypeName.Dynamax;
            case BossType.Gigantamax: return this.BattleTypeName.Gigantamax;
            default: throw new Error(`Invalid boss type: ${bossType}`);
        }
    }

    static getMegaName(language = Translation.Language.English) {
        return this.MegaName;
    }

    static getShadowName(language = Translation.Language.English) {
        return this.ShadowName;
    }

    static async getPokemonName(pokedexId, language = Translation.Language.English) {
        const translationSearchObj = {
            name: Translation.TranslationName.Pokemon,
            key: pokedexId,
            language: language,
            variant: Translation.VariantNull,
            unique: true
        };

        const translationRec = await this.get(translationSearchObj);
        return translationRec.value;
    }

    static async getPokemonDescription(pokedexId, language = Translation.Language.English) {
        const translationSearchObj = {
            name: Translation.TranslationName.PokemonDescription,
            key: pokedexId,
            language: language,
            variant: Translation.VariantNull,
            unique: true
        };

        const translationRec = await this.get(translationSearchObj);
        return translationRec.value;
    }

    static async getPokemonType(type, language = Translation.Language.English) {
        let typeKey;

        switch (type) {
            case PokemonType.Bug:      typeKey = Translation.PokemonTypeKey.Bug; break;
            case PokemonType.Dark:     typeKey = Translation.PokemonTypeKey.Dark; break;
            case PokemonType.Dragon:   typeKey = Translation.PokemonTypeKey.Dragon; break;
            case PokemonType.Electric: typeKey = Translation.PokemonTypeKey.Electric; break;
            case PokemonType.Fairy:    typeKey = Translation.PokemonTypeKey.Fairy; break;
            case PokemonType.Fighting: typeKey = Translation.PokemonTypeKey.Fighting; break;
            case PokemonType.Fire:     typeKey = Translation.PokemonTypeKey.Fire; break;
            case PokemonType.Flying:   typeKey = Translation.PokemonTypeKey.Flying; break;
            case PokemonType.Ghost:    typeKey = Translation.PokemonTypeKey.Ghost; break;
            case PokemonType.Grass:    typeKey = Translation.PokemonTypeKey.Grass; break;
            case PokemonType.Ground:   typeKey = Translation.PokemonTypeKey.Ground; break;
            case PokemonType.Ice:      typeKey = Translation.PokemonTypeKey.Ice; break;
            case PokemonType.Normal:   typeKey = Translation.PokemonTypeKey.Normal; break;
            case PokemonType.Poison:   typeKey = Translation.PokemonTypeKey.Poison; break;
            case PokemonType.Psychic:  typeKey = Translation.PokemonTypeKey.Psychic; break;
            case PokemonType.Rock:     typeKey = Translation.PokemonTypeKey.Rock; break;
            case PokemonType.Steel:    typeKey = Translation.PokemonTypeKey.Steel; break;
            case PokemonType.Water:    typeKey = Translation.PokemonTypeKey.Water; break;
        }
        
        let translationSearchObj = {
            name: Translation.TranslationName.PokemonType,
            key : typeKey,
            language: language,
            variant: Translation.VariantNull,
            unique: true
        }

        const translationRec = await this.get(translationSearchObj);
        return translationRec.value;
    }
    
    // ******************** //
    // * Instance Methods * //
    // ******************** //
    
    async create() {
        // Set some defaults
        if (!this.id) {
            this.id = SnowflakeUtil.generate();
        }

        if (!this.variant) {
            this.variant = Translation.VariantNull;
        }

        if (!this.isPlural) {
            this.isPlural = false;
        }

        // Attempt to create it
        await DatabaseTable.prototype.create.call(this);
    }

    //async update() {
    //    let conditions = {
    //        name: this.name,
    //        id: this.id,
    //        variant: this.variant,
    //        is_plural: this.isPlural,
    //        language: this.language
    //    };
    //
    //    // Attempt to update it
    //    await DatabaseTable.prototype.update.call(this, conditions);
    //}
}
