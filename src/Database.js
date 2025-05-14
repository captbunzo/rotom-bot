
import client from './Client.js';

// Load the database client
import Knex from 'knex';
const knex = Knex(client.config.database);
client.logger.log('Connected to database');

// Import the database objects
import SchemaHistory from './data/SchemaHistory.js';
import MasterPokemon from './data/MasterPokemon.js';
import MasterCPM     from './data/MasterCPM.js';
import Translation   from './data/Translation.js';
import Boss          from './data/Boss.js';
import Trainer       from './data/Trainer.js';
import Battle        from './data/Battle.js';
import BattleMember  from './data/BattleMember.js';
import WikiLink from './data/WikiLink.js';

const newTables = [];

knex.discordBotDatabaseInit = async () => {
    const Tables = [
        SchemaHistory,
        MasterPokemon,
        Battle,
        BattleMember,
        Boss,
        MasterCPM,
        Trainer,
        Translation,
        WikiLink
    ];
    
    client.logger.log(`Creating database tables`);
    for (let table of Tables) {
        await knex.createDiscordBotTable(table);
    }
    
    client.logger.log(`Creating foreign keys`);
    for (let table of Tables) {
        await knex.createDiscordBotForeignKeys(table);
    }
    
    // Cycle through the schema upgrade directories
    // const schemaUpgradeRoot = `modules/upgrade/schema`;
    
/*     const schemaUpgradeDates = fs.readdirSync(schemaUpgradeRoot);
    for (let d = 0; d < schemaUpgradeDates.length; d++) {
        const schemaUpgradeDate = schemaUpgradeDates[d];
        const schemaUpgradeDir  = `${schemaUpgradeRoot}/${schemaUpgradeDate}`;
            
        if (!fs.statSync(`${schemaUpgradeDir}`).isDirectory()) {
            throw new Error(`Schema upgrade directory expected, but it is not a directory: ${schemaUpgradeDir}`);
        }

        const schemaUpgradeScripts = fs.readdirSync(schemaUpgradeDir);
        const schemaUpgrades = [];
        
        for (let s = 0; s < schemaUpgradeScripts.length; s++) {
            const schemaUpgradeScript = schemaUpgradeScripts[s];
            const schemaUpgrade = require(`../${schemaUpgradeDir}/${schemaUpgradeScript}`);
            
            // Check if we should apply this schema upgrade
            const schemaHistoryQuery = {
                matchNewerHistory: true,
                objectType: schemaUpgrade.objectType,
                objectName: schemaUpgrade.objectName,
                logDate: schemaUpgradeDate
            };
            
            const newerSchemaHistories = await SchemaHistory.get(schemaHistoryQuery);
            if (newerSchemaHistories.length == 0) {
                schemaUpgrades.push(schemaUpgrade);
            }
        }
        
        if (schemaUpgrades.length > 0) {
            client.logger.log(`Applying database upgrade: ${schemaUpgradeDate}`);
            for (let u = 0; u < schemaUpgrades.length; u++) {
                const schemaUpgrade = schemaUpgrades[u];
                await schemaUpgrade.run(knex, schemaUpgradeDate);
            }
        }
    } */
};

knex.createDiscordBotTable = async (TableClass) => {
    if (await knex.schema.hasTable(TableClass.schema.tableName)) {
        client.logger.log(`  -> Skipping table: ${client.colorizeTable(TableClass.schema.tableName)} (already exists)`);
        return;
    }
    
    await SchemaHistory.logCreateTable(
        TableClass.schema.tableName, SchemaHistory.STATUS_STARTED, 'Creating table'
    );
    
    try {
        await knex.schema.createTable(TableClass.schema.tableName, async function (table) {
            // Set the table collation, only applicable to MySQL
            table.collate(client.config.databaseCollation);
            
            for (const dbFieldName in TableClass.schema.fields) {
                const field = TableClass.schema.fields[dbFieldName];
                
                // Skip these as we create them later with a special knex function call
                if (dbFieldName == 'created_at' || dbFieldName == 'updated_at') {
                    continue;
                }
                
                const typeString = field.type + (field.type == 'string' ? `(${field.length})` : '');
                const fieldDescription = client.colorizeType(typeString)
                                     + ` ${client.colorizeField(dbFieldName)}`
                                     + (!field.nullable ? client.colorizeNotNull(' NOT NULL') : '');
                
                client.logger.log(`       -> Adding column: ${fieldDescription}`);
                
                if (field.unsigned) {
                    if (field.nullable) {
                        switch (field.type) {
                            case 'tinyint'  : table.tinyint  (dbFieldName).unsigned().nullable(); break;
                            case 'smallint' : table.smallint (dbFieldName).unsigned().nullable(); break;
                            case 'mediumint': table.integer  (dbFieldName).unsigned().nullable(); break;
                            case 'integer'  : table.integer  (dbFieldName).unsigned().nullable(); break;
                            case 'bigint'   : table.bigint   (dbFieldName).unsigned().nullable(); break;
                            default: throw new RangeError(`Invalid unsigned nullable field type: ${field.type}`);
                        }
                    } else {
                        switch (field.type) {
                            case 'tinyint'  : table.tinyint  (dbFieldName).unsigned(); break;
                            case 'smallint' : table.smallint (dbFieldName).unsigned(); break;
                            case 'mediumint': table.integer  (dbFieldName).unsigned(); break;
                            case 'integer'  : table.integer  (dbFieldName).unsigned(); break;
                            case 'bigint'   : table.bigint   (dbFieldName).unsigned(); break;
                            default: throw new RangeError(`Invalid unsigned field type: ${field.type}`);
                        }
                    }
                } else if (field.nullable) {
                    switch (field.type) {
                        case 'snowflake': table.string   (dbFieldName, 20); break;
                        case 'string'   : table.string   (dbFieldName, field.length); break;
                        case 'boolean'  : table.boolean  (dbFieldName); break;
                        case 'date'     : table.date     (dbFieldName); break;
                        case 'datetime' : table.timestamp(dbFieldName); break;
                        case 'float'    : table.float    (dbFieldName); break;
                        case 'double'   : table.double   (dbFieldName); break;
                        case 'decimal'  : table.decimal  (dbFieldName, field.precision, field.scale); break;
                        case 'tinyint'  : table.tinyint  (dbFieldName); break;
                        case 'smallint' : table.smallint (dbFieldName); break;
                        case 'mediumint': table.integer  (dbFieldName); break;
                        case 'integer'  : table.integer  (dbFieldName); break;
                        case 'bigint'   : table.bigint   (dbFieldName); break;
                        default: throw new RangeError(`Invalid nullable field type: ${field.type}`);
                    }
                } else {
                    switch (field.type) {
                        case 'snowflake': table.string   (dbFieldName, 20).notNullable(); break;
                        case 'string'   : table.string   (dbFieldName, field.length).notNullable(); break;
                        case 'boolean'  : table.boolean  (dbFieldName).notNullable(); break;
                        case 'date'     : table.date     (dbFieldName).notNullable(); break;
                        case 'datetime' : table.timestamp(dbFieldName).notNullable(); break;
                        case 'float'    : table.float    (dbFieldName).notNullable(); break;
                        case 'double'   : table.double   (dbFieldName).notNullable(); break;
                        case 'decimal'  : table.decimal  (dbFieldName, field.precision, field.scale).notNullable(); break;
                        case 'tinyint'  : table.tinyint  (dbFieldName).notNullable(); break;
                        case 'smallint' : table.smallint (dbFieldName).notNullable(); break;
                        case 'mediumint': table.integer  (dbFieldName).notNullable(); break;
                        case 'integer'  : table.integer  (dbFieldName).notNullable(); break;
                        case 'bigint'   : table.bigint   (dbFieldName).notNullable(); break;
                        default: throw new RangeError(`Invalid field type: ${field.type}`);
                    }
                }
            }
            
            // Always add timestmaps
            client.logger.log(`       -> Adding timestamps`);
            table.timestamps(false, true);
            
            // Add primary key
            client.logger.log(`       -> Adding primary key: ${TableClass.schema.primaryKey}`);
            table.primary(TableClass.schema.primaryKey);
        });
    } catch (error) {
        await SchemaHistory.logCreateTable(
            TableClass.schema.tableName, SchemaHistory.STATUS_FAILED, error.toString()
        );
        throw error;
    }
    
    newTables.push(TableClass.schema.tableName);
    await SchemaHistory.logCreateTable(
        TableClass.schema.tableName, SchemaHistory.STATUS_COMPLETED, 'Table creation successful'
    );
};

knex.createDiscordBotForeignKeys = async (TableClass) => {
    await knex.schema.hasTable(TableClass.schema.tableName).then(async function(exists) {
        if (!exists) {
            client.logger.log(`  -> Skipping table: ${client.colorizeTable(TableClass.schema.tableName)} (not found!)`);
        } else {
            if (!newTables.includes(TableClass.schema.tableName)) {
                client.logger.log(`  -> Skipping table: ${client.colorizeTable(TableClass.schema.tableName)} (not new)`);
            } else {
                await knex.schema.table(TableClass.schema.tableName, function (table) {
                    // Add foreign keys
                    let fk = 1;
                    for (const dbFieldName in TableClass.schema.fields) { 
                        const field = TableClass.schema.fields[dbFieldName];
                        
                        let refTableName;
                        let refDbFieldName;
                        let onDelete;

                        if (field.refTableName) {
                            refTableName   = field.refTableName;
                            refDbFieldName = 'id';
                            onDelete       = field.onDelete;
                        
                        } else if (field.ref) {
                            refTableName   = field.ref.tableName;
                            refDbFieldName = field.ref.dbFieldName;
                            onDelete       = field.ref.onDelete;
                        }
                        
                        if (refTableName && refDbFieldName) {
                            const fkName = `${TableClass.schema.tableName}_fk${fk++}`;
                            const fkDescription = `${client.colorizeField(dbFieldName)} `
                                                + `references ${client.colorizeTable(refTableName)}(${client.colorizeField(refDbFieldName)}) `
                                                + `as ${client.colorizeFkName(fkName)}`
                                                + `${onDelete ? ' (' + onDelete + ' on delete)' : ''}`;
                            client.logger.log(`       -> Adding foreign key: ${fkDescription}`);
                            
                            table.foreign(dbFieldName)
                                .references(refDbFieldName)
                                .inTable(refTableName)
                                .withKeyName(fkName)
                                .onDelete(onDelete ? onDelete.toUpperCase() : null);
                        }
                    }
                }).then(client.logger.log(`  -> Creating foreign keys for table: ${client.colorizeTable(TableClass.schema.tableName)}`));
            }
        }
    });
};

// Freeze and export
Object.freeze(knex);
export default knex;
