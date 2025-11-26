export const InterimLoadUpdates = 100;
export const MaxAutoCompleteChoices = 25;
export const FieldValueMaxSize = 1024;

export const BotReturnCode = {
    Success: 0,
    Error: 1,
    Restart: 255,
};

export const MessageType = {
    Reply: 'REPLY',
    FollowUp: 'FOLLOW-UP',
};

export const BossType = {
    Raid: 'RAID',
    Dynamax: 'DYNAMAX',
    Gigantamax: 'GIGANTAMAX',
};

export const BattleStatus = {
    Planning: 'PLANNING',
    Started: 'STARTED',
    Completed: 'COMPLETED',
    Failed: 'FAILED',
    Cancelled: 'CANCELLED',
};

export const BattleMemberStatus = {
    Joined: 'JOINED',
    Completed: 'COMPLETED',
    Failed: 'FAILED',
    NotReceived: 'NOT-RECEIVED',
};

export const PokemonType = {
    Bug: 'BUG',
    Dark: 'DARK',
    Dragon: 'DRAGON',
    Electric: 'ELECTRIC',
    Fairy: 'FAIRY',
    Fighting: 'FIGHTING',
    Fire: 'FIRE',
    Flying: 'FLYING',
    Ghost: 'GHOST',
    Grass: 'GRASS',
    Ground: 'GROUND',
    Ice: 'ICE',
    Normal: 'NORMAL',
    Poison: 'POISON',
    Psychic: 'PSYCHIC',
    Rock: 'ROCK',
    Steel: 'STEEL',
    Water: 'WATER',
};

export const PokemonTypeColor = {
    Bug: 0x92bc2c,
    Dark: 0x595761,
    Dragon: 0x0c69c8,
    Electric: 0xf2d94e,
    Fairy: 0xee90e6,
    Fighting: 0xd3425f,
    Fire: 0xfba54c,
    Flying: 0xa1bbec,
    Ghost: 0x5f6dbc,
    Grass: 0x5fbd58,
    Ground: 0xda7c4d,
    Ice: 0x75d0c1,
    Normal: 0xa0a29f,
    Poison: 0xb763cf,
    Psychic: 0xfa8581,
    Rock: 0xc9bb8a,
    Steel: 0x5695a3,
    Water: 0x539ddf,
};

export const SearchStringCode = {
    buddyKm: 'search-buddy-km',
    purifyStardust: 'search-purify-stardust',
};

export const SearchStringName = {
    buddyKm: 'Buddy Walking Distance',
    purifyStardust: 'Buddy Purification Stardust',
};

export const SearchStringBuddyKmName = {
    distance1k: '1 km',
    distance3k: '3 km',
    distance5k: '5 km',
    distance20k: '20 km',
};

export const SearchStringBuddyKmValue = {
    distance1k: 1,
    distance3k: 3,
    distance5k: 5,
    distance20k: 20,
};

export const SearchStringPurifyStardustName = {
    stardust1k: '1,000',
    stardust3k: '3,000',
    stardust5k: '5,000',
    stardust20k: '20,000',
};

export const SearchStringPurifyStardustValue = {
    stardust1k: 1000,
    stardust3k: 3000,
    stardust5k: 5000,
    stardust20k: 20_000,
};

export const Team = {
    Instinct: 'Instinct',
    Mystic: 'Mystic',
    Valor: 'Valor',
};

export const TeamColor = {
    Instinct: 0xffd300,
    Mystic: 0x0076f2,
    Valor: 0xf61208,
};

export enum PokedexEntry {
    Caught = 'Pokémon Caught',
    Shiny = 'Shiny',
    Hundo = 'Hundo',
    Lucky = 'Lucky',
    XXL = 'XXL',
    XXS = 'XXS',
    Shadow = 'Shadow',
    Purified = 'Purified',
}

export const MaxPokedexId = 1008;

export const DiscordErrorUnknown = {
    Account: 10001,
    Application: 10002,
    Channel: 10003,
    Guild: 10004,
    Integration: 10005,
    Invite: 10006,
    Member: 10007,
    Message: 10008,
    Role: 10011,
    Token: 10012,
    User: 10013,
    Emoji: 10014,
    Webhook: 10015,
};
