import { describe, it, expect } from 'vitest';
import { TranslationUtils } from '@/utils/translation.utils.js';
import { BossType } from '@/constants.js';

describe('TranslationUtils', () => {
    describe('constants', () => {
        it('should export VariantNull constant', () => {
            expect(TranslationUtils.VariantNull).toBe('-');
        });

        it('should export ValueBlank constant', () => {
            expect(TranslationUtils.ValueBlank).toBe('-');
        });

        it('should export TranslationName constants', () => {
            expect(TranslationUtils.TranslationName.Pokemon).toBe('poke');
            expect(TranslationUtils.TranslationName.PokemonDescription).toBe('desc');
            expect(TranslationUtils.TranslationName.PokemonType).toBe('poke_type');
        });

        it('should export Language constants', () => {
            expect(TranslationUtils.Language.English).toBe('en');
            expect(TranslationUtils.Language.French).toBe('fr');
            expect(TranslationUtils.Language.German).toBe('de');
            expect(TranslationUtils.Language.Japanese).toBe('ja');
            expect(TranslationUtils.Language.Spanish).toBe('es');
        });

        it('should export DefaultLanguage as English', () => {
            expect(TranslationUtils.DefaultLanguage).toBe('en');
        });

        it('should export LanguageChoices array', () => {
            expect(TranslationUtils.LanguageChoices).toBeInstanceOf(Array);
            expect(TranslationUtils.LanguageChoices.length).toBeGreaterThan(0);

            const englishChoice = TranslationUtils.LanguageChoices.find(
                (c) => c.value === 'en'
            );
            expect(englishChoice).toBeDefined();
            expect(englishChoice?.name).toBe('English');
        });

        it('should export PokemonTypeKey constants', () => {
            expect(TranslationUtils.PokemonTypeKey.Normal).toBe(1);
            expect(TranslationUtils.PokemonTypeKey.Fire).toBe(10);
            expect(TranslationUtils.PokemonTypeKey.Water).toBe(11);
            expect(TranslationUtils.PokemonTypeKey.Electric).toBe(13);
            expect(TranslationUtils.PokemonTypeKey.Dragon).toBe(16);
            expect(TranslationUtils.PokemonTypeKey.Fairy).toBe(18);
        });

        it('should export BossTypeName constants', () => {
            expect(TranslationUtils.BossTypeName.Raid).toBe('Raid');
            expect(TranslationUtils.BossTypeName.Dynamax).toBe('Dynamax');
            expect(TranslationUtils.BossTypeName.Gigantamax).toBe('Gigantamax');
        });

        it('should export BattleTypeName constants', () => {
            expect(TranslationUtils.BattleTypeName.Raid).toBe('Raid');
            expect(TranslationUtils.BattleTypeName.Dynamax).toBe('Dynamax Battle');
            expect(TranslationUtils.BattleTypeName.Gigantamax).toBe('Gigantamax Battle');
        });

        it('should export MegaName constant', () => {
            expect(TranslationUtils.MegaName).toBe('Mega');
        });

        it('should export ShadowName constant', () => {
            expect(TranslationUtils.ShadowName).toBe('Shadow');
        });
    });

    describe('getBossTypeName', () => {
        it('should return Raid for RAID boss type', () => {
            expect(TranslationUtils.getBossTypeName(BossType.Raid)).toBe('Raid');
        });

        it('should return Dynamax for DYNAMAX boss type', () => {
            expect(TranslationUtils.getBossTypeName(BossType.Dynamax)).toBe('Dynamax');
        });

        it('should return Gigantamax for GIGANTAMAX boss type', () => {
            expect(TranslationUtils.getBossTypeName(BossType.Gigantamax)).toBe('Gigantamax');
        });

        it('should throw error for invalid boss type', () => {
            expect(() => TranslationUtils.getBossTypeName('INVALID')).toThrow(
                'Invalid boss type: INVALID'
            );
        });
    });

    describe('getBattleTypeName', () => {
        it('should return Raid for RAID boss type', () => {
            expect(TranslationUtils.getBattleTypeName(BossType.Raid)).toBe('Raid');
        });

        it('should return Dynamax Battle for DYNAMAX boss type', () => {
            expect(TranslationUtils.getBattleTypeName(BossType.Dynamax)).toBe('Dynamax Battle');
        });

        it('should return Gigantamax Battle for GIGANTAMAX boss type', () => {
            expect(TranslationUtils.getBattleTypeName(BossType.Gigantamax)).toBe(
                'Gigantamax Battle'
            );
        });

        it('should throw error for invalid boss type', () => {
            expect(() => TranslationUtils.getBattleTypeName('INVALID')).toThrow(
                'Invalid boss type: INVALID'
            );
        });
    });

    describe('getMegaName', () => {
        it('should return Mega', () => {
            expect(TranslationUtils.getMegaName()).toBe('Mega');
        });

        it('should return Mega regardless of language parameter (currently not implemented)', () => {
            expect(TranslationUtils.getMegaName('fr')).toBe('Mega');
        });
    });

    describe('getShadowName', () => {
        it('should return Shadow', () => {
            expect(TranslationUtils.getShadowName()).toBe('Shadow');
        });

        it('should return Shadow regardless of language parameter (currently not implemented)', () => {
            expect(TranslationUtils.getShadowName('de')).toBe('Shadow');
        });
    });
});
