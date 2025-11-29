# Development Guide

This guide covers development practices, code structure, and contribution guidelines for Rotom Bot.

## Project Structure

```
src/
├── app.ts                 # Application entry point
├── bot.ts                 # Bot initialization
├── client.ts              # Discord client wrapper
├── constants.ts           # Global constants
├── commands/              # Slash commands
│   ├── admin/            # Admin-only commands
│   ├── battle/           # Battle management
│   ├── profile/          # User profile commands
│   └── user/             # General user commands
├── components/           # Discord UI components
│   ├── buttons/          # Button interactions
│   ├── modals/           # Modal forms
│   └── selects/          # Select menus
├── config/               # Configuration management
├── database/             # Database layer
│   ├── entities/         # TypeORM entities
│   ├── repositories/     # Data repositories
│   └── data-source.ts    # Database connection
├── events/               # Discord event handlers
├── functions/            # Utility functions
├── models/               # Legacy models (being migrated)
├── types/                # TypeScript type definitions
└── utils/                # General utilities
```

## Development Workflow

### 1. Setup Development Environment

```bash
# Clone and install
git clone https://github.com/captbunzo/rotom-bot.git
cd rotom-bot
pnpm install

# Configure
cp config.example.json config.json
# Edit config.json with your settings

# Start development server
pnpm run dev
```

### 2. Making Changes

1. **Create a feature branch**

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. **Follow coding standards**
    - Use TypeScript strict mode
    - Follow ESLint configuration
    - Add JSDoc comments for public APIs
    - Write tests for new functionality

3. **Test your changes**

    ```bash
    # Deploy commands for testing
    pnpm run dev -- --deploy-commands

    # Start bot for testing
    pnpm run dev
    ```

4. **Commit and push**
    ```bash
    git add .
    git commit -m "feat: add new feature description"
    git push origin feature/your-feature-name
    ```

## Code Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Define explicit types for all public APIs
- Use interfaces for object shapes
- Prefer `const` over `let` when possible
- Use async/await over Promises

### Naming Conventions

- **Files**: kebab-case (e.g., `trainer-profile.modal.ts`)
- **Classes**: PascalCase (e.g., `TrainerProfileModal`)
- **Functions/Variables**: camelCase (e.g., `showTrainerProfile`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `POKEMON_TYPES`)

### File Naming Patterns

- **Commands**: `*.cmd.ts` (e.g., `setup-profile.cmd.ts`)
- **Events**: `*.event.ts` (e.g., `client-ready.event.ts`)
- **Entities**: `*.entity.ts` (e.g., `trainer.entity.ts`)
- **Components**: `*.{button|modal|select}.ts`

## Adding New Features

### Slash Commands

1. **Create command file** in appropriate subfolder of `src/commands/`
2. **Implement Command interface**:

    ```typescript
    export const MyCommand: Command = {
        global: true, // or false for guild-only
        data: new SlashCommandBuilder().setName('my-command').setDescription('Description here'),
        async execute(interaction: ChatInputCommandInteraction) {
            // Command logic here
        },
    };

    export { MyCommand as CommandClass };
    ```

### Event Handlers

1. **Create event file** in `src/events/`
2. **Implement Event interface**:

    ```typescript
    export class MyEvent implements Event {
        name = Events.SomeEvent;
        once = false;

        async execute(...args: unknown[]) {
            // Event logic here
        }
    }

    export { MyEvent as EventClass };
    ```

### UI Components

1. **Create component file** in appropriate `src/components/` subfolder
2. **Implement component interface**:

    ```typescript
    export class MyButton implements ButtonComponent {
        name = 'my-button';

        async handleButton(interaction: ButtonInteraction) {
            // Button logic here
        }
    }

    export { MyButton as ComponentClass };
    ```

### Database Entities

1. **Create entity file** in `src/database/entities/`
2. **Use TypeORM decorators**:
    ```typescript
    @Entity({ name: 'table_name', schema: 'rotom' })
    export class MyEntity {
        @PrimaryColumn({ type: 'varchar', length: 20 })
        id: string;

        @Column({ type: 'varchar', length: 100 })
        name: string;

        @CreateDateColumn({ name: 'created_at' })
        createdAt: Date;
    }
    ```

## Testing

For comprehensive testing documentation, see the **[Testing Guide](./testing.md)**.

### Quick Start

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

### Manual Testing

1. **Deploy commands** to your test guild:

    ```bash
    pnpm run dev -- --deploy-commands
    ```

2. **Start bot** in development mode:

    ```bash
    pnpm run dev
    ```

3. **Test in Discord** using your test server

### Debugging

- Use `console.log()` or `client.logger.log()` for debugging
- Check Discord Developer Portal for application errors
- Monitor database logs if enabled
- Use VS Code debugger for step-through debugging

## Building for Production

```bash
# Build TypeScript
pnpm run build

# Run production build
node dist/app.js

# Deploy global commands (production)
node dist/app.js --deploy-commands
```

## Environment Considerations

### Development

- Commands deployed to specific guild (faster)
- Enhanced logging enabled
- Hot reload with `pnpm run dev`
- Local database recommended

### Production

- Commands deployed globally (slower initial deploy)
- Production logging levels
- Process management (PM2, systemd, etc.)
- Production database with backups

## Contribution Guidelines

1. **Follow the established patterns** in the codebase
2. **Add documentation** for new features
3. **Test thoroughly** before submitting PR
4. **Keep commits atomic** and well-described
5. **Update relevant documentation** files
6. **Ensure TypeScript compiles** without errors
7. **Follow ESLint rules** and fix any warnings

## Common Issues

### TypeORM Migration

- Entity files must be properly imported in data source
- Column names should match database schema
- Use proper TypeORM decorators

### Discord.js Updates

- Check for breaking changes in Discord.js versions
- Update interaction handling as needed
- Verify permissions and intents

### Configuration

- Ensure all required config values are set
- Use environment variables for sensitive data
- Validate configuration on startup
