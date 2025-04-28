import { Application, DiscordjsError } from "discord.js";

export const Team = {
    Instinct: 'Instinct',
    Mystic:   'Mystic',
    Valor:    'Valor'
}

export const MaxAutoCompleteChoices = 25;

export const BossType = {
    Raid:       'RAID',
    Dynamax:    'DYNAMAX',
    Gigantamax: 'GIGANTAMAX'
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
