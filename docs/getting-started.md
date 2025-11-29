# Getting Started

This guide will help you set up and run Rotom Bot for development or production use.

## Prerequisites

- **Node.js** v18 or higher
- **pnpm** package manager
- **Database** (PostgreSQL, MySQL, or CockroachDB)
- **Discord Application** and Bot Token

## Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/captbunzo/rotom-bot.git
    cd rotom-bot
    ```

2. **Install dependencies**

    ```bash
    pnpm install
    ```

3. **Set up configuration**

    ```bash
    cp config.example.json config.json
    ```

    Edit `config.json` with your settings:
    - Discord bot token
    - Database connection details
    - Guild ID for development
    - Log settings

4. **Set up the database**
    - Create your database
    - Configure connection settings in `config.json`
    - Run migrations (if available)

5. **Deploy Discord commands**

    ```bash
    pnpm run dev -- --deploy-commands
    ```

6. **Start the bot**
    ```bash
    pnpm run dev
    ```

## Command Line Options

The bot supports several command line options:

- **Default/Start**: `pnpm run dev` or `pnpm run dev -- --start`
- **Deploy Commands**: `pnpm run dev -- --deploy-commands`
- **Help**: `pnpm run dev -- --help`

## Development vs Production

### Development

- Use `pnpm run dev` for development with hot reload
- Commands are deployed to a specific guild for faster testing
- Enhanced logging enabled

### Production

- Build with `pnpm run build`
- Run with `node dist/app.js`
- Commands deployed globally
- Production logging configuration

## Next Steps

- [Configuration Guide](./configuration.md)
- [Available Commands](./commands.md)
- [Database Setup](./database.md)
