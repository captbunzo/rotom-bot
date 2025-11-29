import { BossType, PokemonType } from '@/constants.js';
import { translationRepository } from '@/database/repositories.js';

/**
 * Constants for translation utilities
 */
const VariantNull = '-';
const ValueBlank = '-';

const TranslationName = {
    Pokemon: 'poke',
    PokemonDescription: 'desc',
    PokemonType: 'poke_type',
};

const Language = {
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
    Turkish: 'tr',
};

const DefaultLanguage = Language.English;

const LanguageName = {
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
    Turkish: 'Turkish',
};

const LanguageChoices = [
    { name: LanguageName.ChineseTaiwan, value: Language.ChineseTaiwan },
    { name: LanguageName.BrazilianPortuguese, value: Language.BrazilianPortuguese },
    { name: LanguageName.English, value: Language.English },
    { name: LanguageName.French, value: Language.French },
    { name: LanguageName.German, value: Language.German },
    { name: LanguageName.Hindi, value: Language.Hindi },
    { name: LanguageName.Indonesian, value: Language.Indonesian },
    { name: LanguageName.Italian, value: Language.Italian },
    { name: LanguageName.Japanese, value: Language.Japanese },
    { name: LanguageName.Korean, value: Language.Korean },
    { name: LanguageName.Polish, value: Language.Polish },
    { name: LanguageName.Russian, value: Language.Russian },
    { name: LanguageName.Spanish, value: Language.Spanish },
    { name: LanguageName.Swedish, value: Language.Swedish },
    { name: LanguageName.Thai, value: Language.Thai },
    { name: LanguageName.Turkish, value: Language.Turkish },
];

const PokemonTypeKey = {
    Normal: 1,
    Fighting: 2,
    Flying: 3,
    Poison: 4,
    Ground: 5,
    Rock: 6,
    Bug: 7,
    Ghost: 8,
    Steel: 9,
    Fire: 10,
    Water: 11,
    Grass: 12,
    Electric: 13,
    Psychic: 14,
    Ice: 15,
    Dragon: 16,
    Dark: 17,
    Fairy: 18,
};

const BossTypeName = {
    Raid: 'Raid',
    Dynamax: 'Dynamax',
    Gigantamax: 'Gigantamax',
};

const BattleTypeName = {
    Raid: 'Raid',
    Dynamax: 'Dynamax Battle',
    Gigantamax: 'Gigantamax Battle',
};

const MegaName = 'Mega';
const ShadowName = 'Shadow';

/**
 * Utility functions for translation operations
 */
export const TranslationUtils = {
    // Export constants for external use
    VariantNull,
    ValueBlank,
    TranslationName,
    Language,
    DefaultLanguage,
    LanguageName,
    LanguageChoices,
    PokemonTypeKey,
    BossTypeName,
    BattleTypeName,
    MegaName,
    ShadowName,

    /**
     * Get the boss type name
     * @param bossType The boss type string
     * @param language The language code (defaults to English)
     * @returns The localized boss type name
     */
    getBossTypeName(bossType: string, _language = Language.English): string {
        switch (bossType) {
            case BossType.Raid: {
                return BossTypeName.Raid;
            }
            case BossType.Dynamax: {
                return BossTypeName.Dynamax;
            }
            case BossType.Gigantamax: {
                return BossTypeName.Gigantamax;
            }
            default: {
                throw new Error(`Invalid boss type: ${bossType}`);
            }
        }
    },

    /**
     * Get the battle type name
     * @param bossType The boss type string
     * @param language The language code (defaults to English)
     * @returns The localized battle type name
     */
    getBattleTypeName(bossType: string, _language = Language.English): string {
        switch (bossType) {
            case BossType.Raid: {
                return BattleTypeName.Raid;
            }
            case BossType.Dynamax: {
                return BattleTypeName.Dynamax;
            }
            case BossType.Gigantamax: {
                return BattleTypeName.Gigantamax;
            }
            default: {
                throw new Error(`Invalid boss type: ${bossType}`);
            }
        }
    },

    /**
     * Get the mega name
     * @param language The language code (defaults to English)
     * @returns The localized mega name
     */
    getMegaName(_language = Language.English): string {
        return MegaName;
    },

    /**
     * Get the shadow name
     * @param language The language code (defaults to English)
     * @returns The localized shadow name
     */
    getShadowName(_language = Language.English): string {
        return ShadowName;
    },

    /**
     * Get a Pokémon name by Pokédex ID
     * @param pokedexId The Pokédex ID
     * @param language The language code (defaults to English)
     * @returns The localized Pokémon name or null if not found
     */
    async getPokemonName(pokedexId: number, language = Language.English): Promise<string | null> {
        const translation = await translationRepository.findOneBy({
            name: TranslationName.Pokemon,
            key: pokedexId,
            language: language,
            variant: VariantNull,
        });
        return translation ? translation.value : null;
    },

    /**
     * Get a Pokémon description by Pokédex ID
     * @param pokedexId The Pokédex ID
     * @param language The language code (defaults to English)
     * @returns The localized Pokémon description or null if not found
     */
    async getPokemonDescription(
        pokedexId: number,
        language = Language.English
    ): Promise<string | null> {
        const translation = await translationRepository.findOneBy({
            name: TranslationName.PokemonDescription,
            key: pokedexId,
            language: language,
            variant: VariantNull,
        });
        return translation ? translation.value : null;
    },

    /**
     * Get a Pokémon type name
     * @param type The Pokémon type string
     * @param language The language code (defaults to English)
     * @returns The localized Pokémon type name or null if not found
     */
    async getPokemonType(type: string, language = Language.English): Promise<string | null> {
        let typeKey: number | undefined;

        switch (type) {
            case PokemonType.Bug: {
                typeKey = PokemonTypeKey.Bug;
                break;
            }
            case PokemonType.Dark: {
                typeKey = PokemonTypeKey.Dark;
                break;
            }
            case PokemonType.Dragon: {
                typeKey = PokemonTypeKey.Dragon;
                break;
            }
            case PokemonType.Electric: {
                typeKey = PokemonTypeKey.Electric;
                break;
            }
            case PokemonType.Fairy: {
                typeKey = PokemonTypeKey.Fairy;
                break;
            }
            case PokemonType.Fighting: {
                typeKey = PokemonTypeKey.Fighting;
                break;
            }
            case PokemonType.Fire: {
                typeKey = PokemonTypeKey.Fire;
                break;
            }
            case PokemonType.Flying: {
                typeKey = PokemonTypeKey.Flying;
                break;
            }
            case PokemonType.Ghost: {
                typeKey = PokemonTypeKey.Ghost;
                break;
            }
            case PokemonType.Grass: {
                typeKey = PokemonTypeKey.Grass;
                break;
            }
            case PokemonType.Ground: {
                typeKey = PokemonTypeKey.Ground;
                break;
            }
            case PokemonType.Ice: {
                typeKey = PokemonTypeKey.Ice;
                break;
            }
            case PokemonType.Normal: {
                typeKey = PokemonTypeKey.Normal;
                break;
            }
            case PokemonType.Poison: {
                typeKey = PokemonTypeKey.Poison;
                break;
            }
            case PokemonType.Psychic: {
                typeKey = PokemonTypeKey.Psychic;
                break;
            }
            case PokemonType.Rock: {
                typeKey = PokemonTypeKey.Rock;
                break;
            }
            case PokemonType.Steel: {
                typeKey = PokemonTypeKey.Steel;
                break;
            }
            case PokemonType.Water: {
                typeKey = PokemonTypeKey.Water;
                break;
            }
        }

        if (!typeKey) {
            throw new Error(`Invalid Pokemon type: ${type}`);
        }

        const translation = await translationRepository.findOneBy({
            name: TranslationName.PokemonType,
            key: typeKey,
            language: language,
            variant: VariantNull,
        });
        return translation ? translation.value : null;
    },
};
