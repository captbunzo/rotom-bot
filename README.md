# Rotom Bot

A Discord bot designed for Pokémon GO communities to help organize raids, manage trainer profiles, and track Pokédex progress.

## Features

🎯 **Trainer Profiles** - Set up and manage your Pokémon GO trainer information
⚔️ **Battle Coordination** - Organize raids and battles with your community  
📖 **Pokédex Tracking** - Track your caught Pokémon and collection progress
🌍 **Multi-language Support** - Pokémon names and descriptions in multiple languages
🏆 **Guild Management** - Team roles and customizable battle alerts

## Quick Start

1. **Clone and install**

    ```bash
    git clone https://github.com/captbunzo/rotom-bot.git
    cd rotom-bot
    pnpm install
    ```

2. **Configure**

    ```bash
    cp config.example.json config.json
    # Edit config.json with your Discord token and database settings
    ```

3. **Deploy commands**

    ```bash
    pnpm run dev -- --deploy-commands
    ```

4. **Start the bot**
    ```bash
    pnpm run dev
    ```

## Documentation

📖 **[Full Documentation](./docs/README.md)** - Complete guides and references

- [Getting Started](./docs/getting-started.md) - Detailed setup instructions
- [Configuration](./docs/configuration.md) - All configuration options
- [Development](./docs/development.md) - Contributing and development guide
- [Roadmap](./docs/roadmap.md) - Planned features and improvements

## Requirements

- Node.js 18+
- Discord Bot Token
- Database (PostgreSQL, MySQL, or CockroachDB)
- pnpm package manager

## Architecture

- **TypeScript** for type safety and modern JavaScript features
- **Discord.js** for Discord API interactions
- **TypeORM** for database management and migrations
- **Modular Design** with commands, components, and events

## Contributing

We welcome contributions! Please see our [Development Guide](./docs/development.md) for:

- Code standards and practices
- Development setup
- Contribution workflow
- Testing guidelines

## License

See [LICENSE](./LICENSE) for details.

## Support

- 📋 **Issues**: [GitHub Issues](https://github.com/captbunzo/rotom-bot/issues)
- 📖 **Documentation**: [docs/](./docs/)
- 🗺️ **Roadmap**: [docs/roadmap.md](./docs/roadmap.md)
