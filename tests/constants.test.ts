import { describe, it, expect } from 'vitest';
import {
    InterimLoadUpdates,
    MaxAutoCompleteChoices,
    FieldValueMaxSize,
    BotReturnCode,
    MessageType,
    BossType,
    BattleStatus,
    BattleMemberStatus,
    PokemonType,
    PokemonTypeColor,
    SearchStringCode,
    SearchStringName,
    SearchStringBuddyKmName,
    SearchStringBuddyKmValue,
    SearchStringPurifyStardustName,
    SearchStringPurifyStardustValue,
    Team,
    TeamColor,
    PokedexEntry,
    MaxPokedexId,
    DiscordErrorUnknown,
} from '@/constants.js';

describe('Constants', () => {
    describe('General Constants', () => {
        it('should have correct InterimLoadUpdates value', () => {
            expect(InterimLoadUpdates).toBe(100);
        });

        it('should have correct MaxAutoCompleteChoices value', () => {
            expect(MaxAutoCompleteChoices).toBe(25);
        });

        it('should have correct FieldValueMaxSize value', () => {
            expect(FieldValueMaxSize).toBe(1024);
        });

        it('should have correct MaxPokedexId value', () => {
            expect(MaxPokedexId).toBe(1008);
        });
    });

    describe('BotReturnCode', () => {
        it('should have correct return codes', () => {
            expect(BotReturnCode.Success).toBe(0);
            expect(BotReturnCode.Error).toBe(1);
            expect(BotReturnCode.Restart).toBe(255);
        });
    });

    describe('MessageType', () => {
        it('should have correct message types', () => {
            expect(MessageType.Reply).toBe('REPLY');
            expect(MessageType.FollowUp).toBe('FOLLOW-UP');
        });
    });

    describe('BossType', () => {
        it('should have correct boss types', () => {
            expect(BossType.Raid).toBe('RAID');
            expect(BossType.Dynamax).toBe('DYNAMAX');
            expect(BossType.Gigantamax).toBe('GIGANTAMAX');
        });
    });

    describe('BattleStatus', () => {
        it('should have correct battle statuses', () => {
            expect(BattleStatus.Planning).toBe('PLANNING');
            expect(BattleStatus.Started).toBe('STARTED');
            expect(BattleStatus.Completed).toBe('COMPLETED');
            expect(BattleStatus.Failed).toBe('FAILED');
            expect(BattleStatus.Cancelled).toBe('CANCELLED');
        });
    });

    describe('BattleMemberStatus', () => {
        it('should have correct battle member statuses', () => {
            expect(BattleMemberStatus.Joined).toBe('JOINED');
            expect(BattleMemberStatus.Completed).toBe('COMPLETED');
            expect(BattleMemberStatus.Failed).toBe('FAILED');
            expect(BattleMemberStatus.NotReceived).toBe('NOT-RECEIVED');
        });
    });

    describe('PokemonType', () => {
        it('should have all 18 Pokemon types', () => {
            expect(Object.keys(PokemonType)).toHaveLength(18);
        });

        it('should have correct type values', () => {
            expect(PokemonType.Bug).toBe('BUG');
            expect(PokemonType.Dark).toBe('DARK');
            expect(PokemonType.Dragon).toBe('DRAGON');
            expect(PokemonType.Electric).toBe('ELECTRIC');
            expect(PokemonType.Fairy).toBe('FAIRY');
            expect(PokemonType.Fighting).toBe('FIGHTING');
            expect(PokemonType.Fire).toBe('FIRE');
            expect(PokemonType.Flying).toBe('FLYING');
            expect(PokemonType.Ghost).toBe('GHOST');
            expect(PokemonType.Grass).toBe('GRASS');
            expect(PokemonType.Ground).toBe('GROUND');
            expect(PokemonType.Ice).toBe('ICE');
            expect(PokemonType.Normal).toBe('NORMAL');
            expect(PokemonType.Poison).toBe('POISON');
            expect(PokemonType.Psychic).toBe('PSYCHIC');
            expect(PokemonType.Rock).toBe('ROCK');
            expect(PokemonType.Steel).toBe('STEEL');
            expect(PokemonType.Water).toBe('WATER');
        });
    });

    describe('PokemonTypeColor', () => {
        it('should have all 18 Pokemon type colors', () => {
            expect(Object.keys(PokemonTypeColor)).toHaveLength(18);
        });

        it('should have correct color values (hex numbers)', () => {
            expect(PokemonTypeColor.Fire).toBe(0xfba54c);
            expect(PokemonTypeColor.Water).toBe(0x539ddf);
            expect(PokemonTypeColor.Grass).toBe(0x5fbd58);
            expect(PokemonTypeColor.Electric).toBe(0xf2d94e);
        });
    });

    describe('SearchStringCode', () => {
        it('should have correct search string codes', () => {
            expect(SearchStringCode.buddyKm).toBe('search-buddy-km');
            expect(SearchStringCode.purifyStardust).toBe('search-purify-stardust');
        });
    });

    describe('SearchStringName', () => {
        it('should have correct search string names', () => {
            expect(SearchStringName.buddyKm).toBe('Buddy Walking Distance');
            expect(SearchStringName.purifyStardust).toBe('Buddy Purification Stardust');
        });
    });

    describe('SearchStringBuddyKm', () => {
        it('should have correct buddy km names', () => {
            expect(SearchStringBuddyKmName.distance1k).toBe('1 km');
            expect(SearchStringBuddyKmName.distance3k).toBe('3 km');
            expect(SearchStringBuddyKmName.distance5k).toBe('5 km');
            expect(SearchStringBuddyKmName.distance20k).toBe('20 km');
        });

        it('should have correct buddy km values', () => {
            expect(SearchStringBuddyKmValue.distance1k).toBe(1);
            expect(SearchStringBuddyKmValue.distance3k).toBe(3);
            expect(SearchStringBuddyKmValue.distance5k).toBe(5);
            expect(SearchStringBuddyKmValue.distance20k).toBe(20);
        });
    });

    describe('SearchStringPurifyStardust', () => {
        it('should have correct purify stardust names', () => {
            expect(SearchStringPurifyStardustName.stardust1k).toBe('1,000');
            expect(SearchStringPurifyStardustName.stardust3k).toBe('3,000');
            expect(SearchStringPurifyStardustName.stardust5k).toBe('5,000');
            expect(SearchStringPurifyStardustName.stardust20k).toBe('20,000');
        });

        it('should have correct purify stardust values', () => {
            expect(SearchStringPurifyStardustValue.stardust1k).toBe(1000);
            expect(SearchStringPurifyStardustValue.stardust3k).toBe(3000);
            expect(SearchStringPurifyStardustValue.stardust5k).toBe(5000);
            expect(SearchStringPurifyStardustValue.stardust20k).toBe(20_000);
        });
    });

    describe('Team', () => {
        it('should have all three teams', () => {
            expect(Team.Instinct).toBe('Instinct');
            expect(Team.Mystic).toBe('Mystic');
            expect(Team.Valor).toBe('Valor');
        });
    });

    describe('TeamColor', () => {
        it('should have correct team colors', () => {
            expect(TeamColor.Instinct).toBe(0xffd300);
            expect(TeamColor.Mystic).toBe(0x0076f2);
            expect(TeamColor.Valor).toBe(0xf61208);
        });
    });

    describe('PokedexEntry', () => {
        it('should have correct pokedex entry values', () => {
            expect(PokedexEntry.Caught).toBe('Pokémon Caught');
            expect(PokedexEntry.Shiny).toBe('Shiny');
            expect(PokedexEntry.Hundo).toBe('Hundo');
            expect(PokedexEntry.Lucky).toBe('Lucky');
            expect(PokedexEntry.XXL).toBe('XXL');
            expect(PokedexEntry.XXS).toBe('XXS');
            expect(PokedexEntry.Shadow).toBe('Shadow');
            expect(PokedexEntry.Purified).toBe('Purified');
        });

        it('should be an enum with 8 entries', () => {
            const enumValues = Object.values(PokedexEntry);
            // Enums have both forward and reverse mappings, so filter for string values
            const stringValues = enumValues.filter((v) => typeof v === 'string');
            expect(stringValues).toHaveLength(8);
        });
    });

    describe('DiscordErrorUnknown', () => {
        it('should have correct error codes', () => {
            expect(DiscordErrorUnknown.Account).toBe(10001);
            expect(DiscordErrorUnknown.Application).toBe(10002);
            expect(DiscordErrorUnknown.Channel).toBe(10003);
            expect(DiscordErrorUnknown.Guild).toBe(10004);
            expect(DiscordErrorUnknown.Message).toBe(10008);
            expect(DiscordErrorUnknown.User).toBe(10013);
        });
    });
});
