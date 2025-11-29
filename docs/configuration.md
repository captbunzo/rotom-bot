# Configuration

Rotom Bot uses a JSON configuration file to manage settings. This guide explains all available configuration options.

## Configuration File

The bot looks for `config.json` in the project root. Use `config.example.json` as a template.

## Configuration Structure

```json
{
    "discord": {
        "token": "your-bot-token",
        "clientId": "your-application-id",
        "botGuildId": "your-development-guild-id"
    },
    "database": {
        "type": "postgres|mysql|cockroachdb",
        "host": "localhost",
        "port": 5432,
        "username": "username",
        "password": "password",
        "database": "database_name",
        "schema": "rotom"
    },
    "log": {
        "level": "info|debug|warn|error",
        "sql": false
    },
    "options": {
        "showBattleMemberTrainerNames": true
    },
    "emoji": {
        "shiny": "✨"
    }
}
```

## Discord Configuration

### `discord.token`

- **Type**: String
- **Required**: Yes
- **Description**: Your Discord bot token from the Developer Portal

### `discord.clientId`

- **Type**: String
- **Required**: Yes
- **Description**: Your Discord application ID

### `discord.botGuildId`

- **Type**: String
- **Required**: Development only
- **Description**: Guild ID for development command deployment

## Database Configuration

### `database.type`

- **Type**: String
- **Required**: Yes
- **Options**: `postgres`, `mysql`, `cockroachdb`
- **Description**: Database type

### `database.host`

- **Type**: String
- **Required**: Yes
- **Description**: Database host address

### `database.port`

- **Type**: Number
- **Required**: Yes
- **Description**: Database port

### `database.username`

- **Type**: String
- **Required**: Yes
- **Description**: Database username

### `database.password`

- **Type**: String
- **Required**: Yes
- **Description**: Database password

### `database.database`

- **Type**: String
- **Required**: Yes
- **Description**: Database name

### `database.schema`

- **Type**: String
- **Default**: `rotom`
- **Description**: Database schema name

## Logging Configuration

### `log.level`

- **Type**: String
- **Options**: `debug`, `info`, `warn`, `error`
- **Default**: `info`
- **Description**: Minimum log level to output

### `log.sql`

- **Type**: Boolean
- **Default**: `false`
- **Description**: Enable SQL query logging

## Bot Options

### `options.showBattleMemberTrainerNames`

- **Type**: Boolean
- **Default**: `true`
- **Description**: Show trainer names instead of Discord usernames in battle member lists

## Emoji Configuration

### `emoji.shiny`

- **Type**: String
- **Default**: `✨`
- **Description**: Emoji used to represent shiny Pokémon

## Environment Variables

You can also use environment variables for sensitive data:

```bash
DISCORD_TOKEN=your-bot-token
DATABASE_PASSWORD=your-database-password
```

Configuration priority: Environment Variables > config.json > defaults

## Security Notes

- Never commit `config.json` with real credentials
- Use environment variables in production
- Keep your bot token secure
- Regularly rotate credentials
