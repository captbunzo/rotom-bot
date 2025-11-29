# TypeORM Migration Guide

This document outlines the migration from the custom Dross ORM to TypeORM in Rotom Bot.

## Overview

The bot has been migrated from a custom ORM system (`@drossjs/dross-database`) to TypeORM for better maintainability, type safety, and ecosystem support.

## Key Changes

### Entity Structure

**Before (Custom ORM)**:

```typescript
export class Trainer extends DrossDatabaseTable {
    static override schema = this.parseSchema({
        tableName: 'trainer',
        fields: {
            discord_id: { type: DrossFieldType.Snowflake, nullable: false },
            trainer_name: { type: DrossFieldType.String, nullable: true, length: 32 },
        },
        primaryKey: ['discord_id'],
    });
}
```

**After (TypeORM)**:

```typescript
@Entity({ name: 'trainer', schema: 'rotom' })
export class Trainer {
    @PrimaryColumn({ name: 'discord_id', type: 'varchar', length: 20 })
    discordId: string;

    @Column({ name: 'trainer_name', type: 'varchar', length: 32, nullable: true })
    trainerName: string;
}
```

## Converted Entities

The following entities have been converted from the custom ORM:

1. **Battle** - `battle.entity.ts`
2. **BattleMember** - `battle-member.entity.ts`
3. **Boss** - `boss.entity.ts`
4. **GuildBattleAlert** - `guild-battle-alert.entity.ts`
5. **GuildTeamRole** - `guild-team-role.entity.ts`
6. **MasterCPM** - `master-cpm.entity.ts`
7. **MasterPokemon** - `master-pokemon.entity.ts`
8. **PogoHubLink** - `pogo-hub-link.entity.ts`
9. **Pokedex** - `pokedex.entity.ts`
10. **PokedexPokemon** - `pokedex-pokemon.entity.ts`
11. **Trainer** - `trainer.entity.ts`
12. **Translation** - `translation.entity.ts`
13. **WikiLink** - `wiki-link.entity.ts`

## Migration Highlights

### Type Mapping

| Custom ORM Type                    | TypeORM Type                | Notes                 |
| ---------------------------------- | --------------------------- | --------------------- |
| `DrossFieldType.Snowflake`         | `varchar(20)`               | Discord Snowflake IDs |
| `DrossFieldType.String`            | `varchar(length)`           | Text fields           |
| `DrossFieldType.TinyInt` (boolean) | `boolean`                   | Boolean flags         |
| `DrossFieldType.SmallInt`          | `smallint`                  | Small numbers         |
| `DrossFieldType.Decimal`           | `decimal(precision, scale)` | Precise decimals      |

### Schema Changes

- **Schema Name**: All entities use the `rotom` schema
- **Timestamps**: Added `created_at` and `updated_at` fields to all entities
- **Primary Keys**: Composite keys properly defined with `@PrimaryColumn()`
- **Nullable Fields**: Explicit nullable configuration

### Key Benefits

1. **Better TypeScript Integration**: Native TypeScript support
2. **Ecosystem Support**: Extensive community and tooling
3. **Migrations**: Built-in migration system
4. **Query Builder**: Powerful query capabilities
5. **Relationships**: Better support for entity relationships

## Database Setup

### Configuration

Update your `config.json` to work with TypeORM:

```json
{
    "database": {
        "type": "postgres",
        "host": "localhost",
        "port": 5432,
        "username": "username",
        "password": "password",
        "database": "database_name",
        "schema": "rotom",
        "synchronize": false,
        "logging": true
    }
}
```

### Data Source Configuration

The TypeORM data source is configured in `src/database/data-source.ts`:

```typescript
import { DataSource } from 'typeorm';
import { config } from '@/config';
import { Trainer } from '@/database/entities/trainer.entity';
// ... other entities

export const AppDataSource = new DataSource({
    type: config.database.type,
    host: config.database.host,
    port: config.database.port,
    username: config.database.username,
    password: config.database.password,
    database: config.database.database,
    schema: config.database.schema,
    entities: [Trainer /* ... other entities */],
    migrations: ['src/migrations/*.ts'],
    synchronize: false,
    logging: config.log.sql,
});
```

## Migration Checklist

- [x] Create TypeORM entity files for all models
- [x] Map field types appropriately
- [x] Configure composite primary keys
- [x] Add timestamp fields
- [ ] Create TypeORM data source configuration
- [ ] Update repository layer
- [ ] Create database migrations
- [ ] Update service layer to use TypeORM repositories
- [ ] Test all database operations
- [ ] Update command handlers
- [ ] Verify business logic integrity

## Next Steps

1. **Repository Layer**: Create TypeORM repositories to replace custom ORM methods
2. **Migration Scripts**: Generate migrations for existing database structure
3. **Service Updates**: Update service classes to use TypeORM repositories
4. **Testing**: Comprehensive testing of all database operations
5. **Deployment**: Plan for production migration

## Compatibility Notes

- **Field Names**: Database column names remain the same (snake_case)
- **Data Types**: All data types are preserved
- **Constraints**: Primary keys and nullable fields maintained
- **Business Logic**: Core functionality unchanged

## Troubleshooting

Common issues during migration:

1. **Type Mismatches**: Ensure TypeORM types match database schema
2. **Column Names**: Use `@Column({ name: 'snake_case' })` for proper mapping
3. **Composite Keys**: Define all parts of composite keys with `@PrimaryColumn()`
4. **Nullable Fields**: Explicitly set `nullable: true` where needed
