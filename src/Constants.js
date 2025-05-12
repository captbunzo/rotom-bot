
export const Team = {
    Instinct: 'Instinct',
    Mystic:   'Mystic',
    Valor:    'Valor'
}

export const TeamColor = {
    Instinct: 0xFFD300,
    Mystic:   0x0076F2,
    Valor:    0xF61208
}

export const InterimLoadUpdates     = 100;
export const MaxAutoCompleteChoices = 25;
export const FieldValueMaxSize      = 1024;

export const BossType = {
    Raid:       'RAID',
    Dynamax:    'DYNAMAX',
    Gigantamax: 'GIGANTAMAX'
}

export const BattleStatus = {
    Planning:  'PLANNING',
    Started:   'STARTED',
    Completed: 'COMPLETED',
    Failed:    'FAILED',
    Cancelled: 'CANCELLED'
}

export const BattleMemberStatus = {
    Joined:      'JOINED',
    Completed:   'COMPLETED',
    Failed:      'FAILED',
    NotReceived: 'NOT-RECEIVED'
}

export const SearchStringBuddyKmName = {
    distance1k:  '1 km',
    distance3k:  '3 km',
    distance5k:  '5 km',
    distance20k: '20 km'
}

export const SearchStringCode = {
    buddyKm: 'search-buddy-km',
    purifyStardust: 'search-purify-stardust'
}

export const SearchStringName = {
    buddyKm: 'Buddy Walking Distance',
    purifyStardust: 'Buddy Purification Stardust'
}

export const SearchStringBuddyKmValue = {
    distance1k:  1,
    distance3k:  3,
    distance5k:  5,
    distance20k: 20
}

export const SearchStringPurifyStardustName = {
    stardust1k:  '1,000',
    stardust3k:  '3,000',
    stardust5k:  '5,000',
    stardust20k: '20,000'
}

export const SearchStringPurifyStardustValue = {
    stardust1k:  1000,
    stardust3k:  3000,
    stardust5k:  5000,
    stardust20k: 20000
}

export const PokemonType = {
    Bug:      'BUG',
    Dark:     'DARK',
    Dragon:   'DRAGON',
    Electric: 'ELECTRIC',
    Fairy:    'FAIRY',
    Fighting: 'FIGHTING',
    Fire:     'FIRE',
    Flying:   'FLYING',
    Ghost:    'GHOST',
    Grass:    'GRASS',
    Ground:   'GROUND',
    Ice:      'ICE',
    Normal:   'NORMAL',
    Poison:   'POISON',
    Psychic:  'PSYCHIC',
    Rock:     'ROCK',
    Steel:    'STEEL',
    Water:    'WATER'
}

export const PokemonTypeColor = {
    Bug:      0x92BC2C,
    Dark:     0x595761,
    Dragon:   0x0C69C8,
    Electric: 0xF2D94E,
    Fairy:    0xEE90E6,
    Fighting: 0xD3425F,
    Fire:     0xFBA54C,
    Flying:   0xA1BBEC,
    Ghost:    0x5F6DBC,
    Grass:    0x5FBD58,
    Ground:   0xDA7C4D,
    Ice:      0x75D0C1,
    Normal:   0xA0A29F,
    Poison:   0xB763CF,
    Psychic:  0xFA8581,
    Rock:     0xC9BB8A,
    Steel:    0x5695A3,
    Water:    0x539DDF
}

// Discord API errors
export const DiscordErrorUnknown = {
    Account:     10001,
    Application: 10002,
    Channel:     10003,
    Guild:       10004,
    Integration: 10005,
    Invite:      10006,
    Member:      10007,
    Message:     10008,
    Role:        10011,
    Token:       10012,
    User:        10013,
    Emoji:       10014,
    Webhook:     10015
}
