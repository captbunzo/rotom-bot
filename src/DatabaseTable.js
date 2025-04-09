
// Load our classes
import Timestamp from './Timestamp.js';

// Load external modules and functions
import StringFunctions from './functions/StringFunctions.js';

// Load singletons
import client from './Client.js';
import knex from './Database.js';

export default class DatabaseTable {
    static schema = {
        tableName: null,
        orderBy: 'created_at',
        fields: []
    };
        
    constructor(data) {
        this.data = {};
        this.temp = {};

        //for (const dbFieldName in this.schema.fields) {
        //    const field = this.schema.fields[dbFieldName];
        //    
        //    if (field.objectFieldName in this) {
        //        Object.defineProperty (this, field.objectFieldName, {
        //            get: function () {
        //                console.log('GET', field.objectFieldName);
        //                return this.data[field.objectFieldName];
        //            },
        //            set: function (value) {
        //                console.log('SET', field.objectFieldName, value);
        //                this.data[field.objectFieldName] = value;
        //            }
        //        });
        //    }
        //}
        
        // Iterate over the incoming field data
        for (const name in data) {
            const value = data[name];
            
            if ( value // For null values (for some reason they come through as objects) 
                  && typeof value == 'object' && value.constructor && value.constructor.name != 'Date' ) {
                this[name] = data[name];
                delete data[name];
                continue;
            }
            
            const dbFieldName     = StringFunctions.camelToSnakeCase(name);
            const objectFieldName = StringFunctions.snakeToCamelCase(dbFieldName);
            
            if (this.schema.fields[dbFieldName] != undefined) {
                this[objectFieldName] = data[name];
            } else {
                throw new Error(`Unrecognized field - ${name}`);
            }
        }
        
        // Set any default values
        for (const dbFieldName in this.schema.fields) {
            const field = this.schema.fields[dbFieldName];
            const objectFieldName = StringFunctions.snakeToCamelCase(dbFieldName);
            
            if (field.default != undefined && this[objectFieldName] == null) {
                this[objectFieldName] = field.default;
            }
        }
        
        // Check if this is a new object
        if (!this.createdAt && !this.updatedAt) {
            const timestamp = knex.fn.now();
            this.createdAt = timestamp;
            this.updatedAt = timestamp;
        }
    }
    
    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    //static new(data) {
    //    const object = new this(data);
    //    
    //    const handler = {
    //        get: function (target, property, value) {
    //            if (target[property] == undefined) {
    //                target.validateFieldName('id');
    //                return target.data[property];
    //            }
    //            
    //            return Reflect.get(...arguments);
    //        }
    //    };
    //    
    //    return new Proxy(object, handler);
    //}

    static parseSchema(schema) {
        // Always add these as they are on all tables
        schema.fields.created_at = { type: 'datetime', nullable: false };
        schema.fields.updated_at = { type: 'datetime', nullable: false };
        
        // Initialize the object map
        schema.objectMap = new Map();
        
        // Add all the objects
        if (!schema.objects) schema.objects = [];
        
        for (let o = 0; o < schema.objects.length; o++) {
            const object = schema.objects[o];
            schema.objectMap.set(object.objectName, object);
        }
        
        // Check if we need to add the default primary key
        if (!schema.primaryKey) {
            schema.primaryKey = 'id';
        }
        
        // And return the result
        return schema;
    }
    
    static getField(fieldName) {
        return this.schema.fields[StringFunctions.camelToSnakeCase(fieldName)];
    }
    
    static getFieldValidValues(fieldName) {
        const field = this.schema.fields[StringFunctions.camelToSnakeCase(fieldName)];
        return ( field && field.validValues ? field.validValues : [] );
    }
    
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        let parsedConditions = conditions;
        let unique = false;
        
        // Parse the select conditions
        if (typeof parsedConditions == 'object') {
            if (parsedConditions.unique != null) {
                unique = parsedConditions.unique;
                delete parsedConditions.unique;
            }
            
            parsedConditions = this.parseConditions(parsedConditions);
            parsedConditions = this.parseFieldConditions(parsedConditions);
        }
        
        client.logger.sql(`get : tableName = ${this.schema.tableName}`);
        
        client.logger.sql(`get : conditions`);
        client.logger.sqldump(conditions);
        
        client.logger.sql(`get : parsedConditions`);
        client.logger.sqldump(parsedConditions);
        
        // For debugging purposes, generate the sql
        const sql = await knex(this.schema.tableName)
            .where(parsedConditions)
            .orderBy(orderBy)
            .select()
            .toSQL();
        
        client.logger.sql(`Executing SQL: ${sql.sql}`);
        client.logger.sql(`With Bindings: ${sql.bindings}`);
        
        // Execute the select and gather the results
        const rows = await knex(this.schema.tableName)
            .where(parsedConditions)
            .orderBy(orderBy)
            .then(function(rows) {
                return rows;
            });
        
        const objects = [];
        for (let x = 0; x < rows.length; x++) {
            objects.push(new this(rows[x]));
        }
        
        // Handle this extra carefully if a unique result was expected
        if (unique) {
            if (objects.length > 1) {
                throw new Error(`Found ${objects.length} records from ${this.schema.tableName} when only one was expected`);
            }
            return ( objects.length == 0 ? null : objects[0] );
        }
        
        // Otherwise just return the array of objects
        return objects;
    }
    
    static async delete(conditions) {
        let parsedConditions = conditions;
        
        // Parse the select conditions
        if (typeof parsedConditions == 'object') {
            parsedConditions = this.parseConditions(parsedConditions);
            parsedConditions = this.parseFieldConditions(parsedConditions);
        }
        
        // For debugging purposes, generate the sql
        const sql = await knex(this.schema.tableName)
            .where(parsedConditions)
            .delete()
            .toSQL();
        
        client.logger.sql(`Executing SQL: ${sql.sql}`);
        client.logger.sql(`With Bindings: ${sql.bindings}`);
        
        return await knex(this.schema.tableName)
            .where(parsedConditions)
            .delete()
            .then(result => {
                return result;
            });
    }
    
    static parseConditions(conditions) {
        return conditions;
    }
    
    static parseFieldConditions(conditions) {
        if (typeof conditions != 'object') {
            return conditions;
        }
        
        const parsedConditions = {};
        
        for (const fieldName in conditions) {
            const dbFieldName = StringFunctions.camelToSnakeCase(fieldName);
            const field = this.schema.fields[dbFieldName];
            
            if (field) {
                parsedConditions[dbFieldName] = conditions[fieldName];
            } else {
                throw new Error(`Unrecognized field - ${fieldName}`);
            }
        }
        
        return parsedConditions;
    }
    
    static getTableName() {
        return this.schema.tableName;
    }
    
    // ******************** //
    // * Instance Methods * //
    // ******************** //
    
    async create() {
        // For debugging purposes, generate the sql
        const sql = await knex(this.schema.tableName)
            .insert(this.data)
            .toSQL();
        
        client.logger.sql(`Executing SQL: ${sql.sql}`);
        client.logger.sql(`With Bindings: ${sql.bindings}`);
        
        // Execute the insert
        return await knex(this.schema.tableName)
            .insert(this.data)
            .then(function(result) {
                return result;
            });
    }
    
    async update(conditions = {id: this.id}) {
        // Update the timestamp
        this.updatedAt = knex.fn.now();
        
        // For debugging purposes, generate the sql
        const sql = await knex(this.schema.tableName)
            .where(conditions)
            .update(this.data)
            .toSQL();
        
        client.logger.sql(`Executing SQL: ${sql.sql}`);
        client.logger.sql(`With Bindings: ${sql.bindings}`);
        
        const rowsChanged = await knex(this.schema.tableName)
            .where(conditions)
            .update(this.data)
            .then(result => {
                return result;
            });
        
        if (rowsChanged == 0) {
            throw new Error('Update did not change any records!');
        } else if (rowsChanged > 1) {
            throw new Error('Update changed more then one record!');
        }
        
        return rowsChanged;
    }
    
    async delete(conditions = {id: this.id}) {        
        // For debugging purposes, generate the sql
        const sql = await knex(this.schema.tableName)
            .where(conditions)
            .delete()
            .toSQL();
        
        client.logger.sql(`Executing SQL: ${sql.sql}`);
        client.logger.sql(`With Bindings: ${sql.bindings}`);
        
        return await knex(this.schema.tableName)
            .where(conditions)
            .delete()
            .then(result => {
                return result;
            });
    }
    
    getTableName() {
        return this.schema.tableName;
    }
    
    // ****************************** //
    // * Field Validation Functions * //
    // ****************************** //
    
    validateFieldName(fieldName) {
        if (!this.hasFieldName(fieldName)) {
            throw new RangeError(`Column ${this.schema.tableName}.${fieldName} does exist`);
        }
        return true;
    }
    
    hasFieldName(fieldName) {
        return (this.constructor.schema.fields[StringFunctions.camelToSnakeCase(fieldName)] != undefined);
    }
    
    // ************ //
    // * Getters  * //
    // ************ //
    
    get schema() {
        return this.constructor.schema;
    }
    
    // Generic get field and object functions
    
    //
    // TODO - We really should figure out how to make these getters and setters properly dynamic
    //
    
    getField(camelName) {
        const snakeName = StringFunctions.camelToSnakeCase(camelName);
        this.validateFieldName(snakeName);
        return this.data[snakeName];
    }
    
    getJSONField(camelName) {
        const snakeName = StringFunctions.camelToSnakeCase(camelName);
        this.validateFieldName(snakeName);
        return JSON.parse(this.data[snakeName]);
    }
    
    getObject(camelName, camelId = `${camelName}Id`) {
        return this.temp[camelName];
    }
    
    // Standard ID field most tables have
    
    get id                  () { return this.getField('id'); }
    
    // Property fields
    
    get code                () { return this.getField('code'); }
    get comment             () { return this.getField('comment'); }
    get level               () { return this.getField('level'); }
    get logType             () { return this.getField('logType'); }
    get objectName          () { return this.getField('objectName'); }
    get objectType          () { return this.getField('objectType'); }
    get name                () { return this.getField('name'); }
    get status              () { return this.getField('status'); }
    get team                () { return this.getField('team'); }
    
    get logDate() {
        this.validateFieldName('logDate');
        return new Date(this.data['log_date']);
    }
    
    // Standard datetime fields
    
    get createdAt           () { return this.getField('createdAt'); }
    get updatedAt           () { return this.getField('updatedAt'); }
    
    // Object identifier fields
    
    get trainerId           () { return this.getField('trainerId'); }

    // JSON identifier fields
    
    get ownerIds            () { return this.getJSONField('ownerIds'); }
    
    // Objects
    
    // get activity          () { return this.getObject('activity'); }
    // get activityCategory  () { return this.getObject('activityCategory'); }
    // get alliance          () { return this.getObject('alliance'); }
    // get author            () { return this.getObject('author'); }
    // get channel           () { return this.getObject('channel'); }
    // get channelGroup      () { return this.getObject('channelGroup'); }
    // get configChannel     () { return this.getObject('configChannel'); }
    // get creator           () { return this.getObject('creator'); }
    // get discordChannel    () { return this.getObject('discordChannel'); }
    // get event             () { return this.getObject('event'); }
    // get guardian          () { return this.getObject('guardian'); }
    // get guild             () { return this.getObject('guild'); }
    // get joinedFromChannel () { return this.getObject('joinedFromChannel'); }
    // get joinedFromGuild   () { return this.getObject('joinedFromGuild'); }
    // get origChannel       () { return this.getObject('origChannel'); }
    // get origGuild         () { return this.getObject('origGuild'); }
    // get origMessage       () { return this.getObject('origMessage'); }
    // get updater           () { return this.getObject('updater'); }
    // get userFriendlyId    () { return this.getObject('userFriendlyId'); }
    // get webhook           () { return this.getObject('webhook'); }
    
    // *********** //
    // * Setters * //
    // ********** //
    
    // Generic get field and object functions
    
    //
    // TODO - We really should figure out how to make these getters and setters properly dynamic
    //
    
    setField(value, camelName) {
        const snakeName = StringFunctions.camelToSnakeCase(camelName);
        this.validateFieldName(snakeName);
        
        let cleansedValue = value;

        if (typeof cleansedValue == 'string') {
            cleansedValue = cleansedValue.trim();
        }

        if (cleansedValue !== null && cleansedValue.length == 0) {
            cleansedValue = null;
        }

        if (cleansedValue) {
            switch (camelName) {
                case 'alias':
                case 'clanShortName':
                case 'shortName':
                case 'symbol':
                    cleansedValue = cleansedValue.toUpperCase();
                    break;
                
                case 'commandChannelType':
                case 'reactionMessageType':
                case 'type':
                    cleansedValue = cleansedValue.toLowerCase();
                    break;
                
                case 'logDate':
                    cleansedValue = (typeof cleansedValue == 'string' ? cleansedValue : new Timestamp(null, cleansedValue).getLogDate());
                    break;
                
                case 'createdAt':
                    if (this.createdAt) {
                        throw new Error('Cowardly refusing to change creation timestamp!');
                    }
                    break;
            }
        }
        
        this.data[snakeName] = cleansedValue;
    }
    
    setJSONField(value, camelName) {
        const snakeName = StringFunctions.camelToSnakeCase(camelName);
        this.validateFieldName(snakeName);
        
        const jsonValue = (typeof value == 'string' ? value : JSON.stringify(value));
        this.data[snakeName] = jsonValue;
    }
    
    setObject(object, camelName) {
        this.temp[camelName] = object;
    }
    
    // Standard ID field most tables have
    
    set id                  (value) { this.setField(value, 'id'); }
    
    // Property fields
    
    set code                (value) { this.setField(value, 'code'); }
    set comment             (value) { this.setField(value, 'comment'); }
    set level               (value) { this.setField(value, 'level'); }
    set logDate             (value) { this.setField(value, 'logDate'); }
    set logType             (value) { this.setField(value, 'logType'); }
    set name                (value) { this.setField(value, 'name'); }
    set objectName          (value) { this.setField(value, 'objectName'); }
    set objectType          (value) { this.setField(value, 'objectType'); }
    set status              (value) { this.setField(value, 'status'); }
    set team                (value) { this.setField(value, 'team'); }
    
    // Standard datetime fields
        
    set createdAt           (value) { this.setField(value, 'createdAt'); }
    set updatedAt           (value) { this.setField(value, 'updatedAt'); }
    
    // Object identifier fields
    
    set trainerId           (value) { this.setField(value, 'trainerId'); }
    
    // JSON identifier fields
    
    set ownerIds            (value) { this.setJSONField(value, 'ownerIds'); }
    
    // Objects
    
    set activity(object) {
        this.setObject(object, 'activity');
        
        if (object) {
            if (this.hasFieldName('activityId')) this.activityId = object.id;
            if (this.hasFieldName('activityCategoryId')) this.activityCategoryId = object.activityCategoryId;
            if (this.hasFieldName('fireteamSize') && !this.fireteamSize) this.fireteamSize = object.fireteamSize;
            if (this.hasFieldName('estMaxDuration') && !this.estMaxDuration) this.estMaxDuration = object.estMaxDuration;
        }
    }
    
    set activityCategory(object) {
        this.setObject(object, 'activityCategory');
        
        if (object) {
            if (this.hasFieldName('activityCategoryId')) this.activityCategoryId = object.id;
        }
    }
    
    set alliance(object) {
        this.setObject(object, 'alliance');
        
        if (object) {
            if (this.hasFieldName('allianceId')) this.allianceId = object.id;
        }
    }
    
    set configChannel(object) {
        this.setObject(object, 'configChannel');
        
        if (object) {
            if (this.hasFieldName('configChannelId')) this.configChannelId = object.id;
        }
    }
    
    set event(object) {
        this.setObject(object, 'event');
        
        if (object) {
            if (this.hasFieldName('eventId')) this.eventId = object.id;
        }
    }
    
    set guild(object) {
        this.setObject(object, 'guild');
        
        if (object) {
            if (this.hasFieldName('guildId')) this.guildId = object.id;
        }
    }
    
    set allianceGuild    (object) { this.setObject(object, 'allianceGuild'); }
    set author           (object) { this.setObject(object, 'author'); }
    set channel          (object) { this.setObject(object, 'channel'); }
    set channelGroup     (object) { this.setObject(object, 'channelGroup'); }
    set creator          (object) { this.setObject(object, 'creator'); }
    set discordChannel   (object) { this.setObject(object, 'discordChannel'); }
    set guardian         (object) { this.setObject(object, 'guardian'); }
    set origChannel      (object) { this.setObject(object, 'origChannel'); }
    set origGuild        (object) { this.setObject(object, 'origGuild'); }
    set origMessage      (object) { this.setObject(object, 'origMessage'); }
  //set owner            (object) { this.setObject(object, 'owner'); }
    set updater          (object) { this.setObject(object, 'updater'); }
    
    set userFriendlyId(object) {
        this.setObject(object, 'userFriendlyId');
        
        if (object) {
            if (this.hasFieldName('ufid'))
                this.ufid = object.ufid;
        }
    }
    
    set webhook(object) {
        this.setObject(object, 'webhook');

        if (object) {
            if (this.hasFieldName('webhookId'))
                this.webhookId = object.id;
            
            if (this.hasFieldName('webhookUrl'))
                this.webhookUrl = object.url;
        }
    }
    
    // ************************************************************ //
    // * Instance Methods - Helper methods to get related objects * //
    // ************************************************************ //
    
    async getObjectFromSource(
        camelName,
        options = {required: false},
        className = StringFunctions.capitalize(camelName),
        camelId = `${camelName}Id`
    ) {
        if (this[camelName]) {
            return this[camelName];
        }

        switch (camelName) {
            case 'discordChannel': {
                const Channel = require(`./data/Channel.js`);
                camelId = (this.getTableName() == Channel.getTableName() ? 'id' : 'channelId');
                try {
                    this[camelName] = await client.channels.fetch(this[camelId]);
                } catch (error) {
                    if (error.code != client.DISCORD_ERROR_UNKNOWN_CHANNEL) throw error;
                    this[camelName] = null;
                }
                break;
            }

            case 'discordGuild': {
                const Guild = require(`./data/Guild.js`);
                camelId = (this.getTableName() == Guild.getTableName() ? 'id' : 'guildId');
                try {
                    this[camelName] = await client.guilds.fetch(this[camelId]);
                } catch (error) {
                    if (error.code != client.DISCORD_ERROR_UNKNOWN_GUILD) throw error;
                    this[camelName] = null;
                }
                break;
            }

            case 'discordMessage': {
                await this.getDiscordChannel(true);
                const Message = require(`./data/Message.js`);
                camelId = (this.getTableName() == Message.getTableName() ? 'id' : 'messageId');
                try {
                    this[camelName] = await this.discordChannel.messages.fetch(this[camelId]);
                } catch (error) {
                    if (error.code != client.DISCORD_ERROR_UNKNOWN_MESSAGE) throw error;
                    this[camelName] = null;
                }
                break;
            }
            
            case 'user': {
                const Guardian    = require(`./data/Guardian.js`);
                const Participant = require(`./data/Participant.js`);
                
                switch (this.getTableName()) {
                    case    Guardian.getTableName() : camelId = 'id'; break;
                    case Participant.getTableName() : camelId = 'guardianId'; break;
                    default: throw new Error(`Cannot get discord user for ${this.getTableName()}`);
                }
                
                try {
                    this[camelName] = await client.users.fetch(this[camelId]);
                } catch (error) {
                    if (error.code != client.DISCORD_ERROR_UNKNOWN_USER) throw error;
                    this[camelName] = null;
                }
                break;
            }

            case 'guardian': {
                const Guardian    = require(`./data/Guardian.js`);
                const Participant = require(`./data/Participant.js`);
                
                switch (this.getTableName()) {
                    case    Guardian.getTableName() : camelId = 'id'; break;
                    case Participant.getTableName() : camelId = 'guardianId'; break;
                    default: throw new Error(`Cannot get discord user for ${this.getTableName()}`);
                }
                
                if (this[camelId]) {
                    this[camelName] = await Guardian.get({id: this[camelId], unique: true});
                }
                break;
            }

            case 'webhook': {
                try {
                    this[camelName] = await client.fetchWebhook(this.webhookId);
                } catch (error) {
                    if (error.code != client.DISCORD_ERROR_UNKNOWN_WEBHOOK) throw error;
                    this[camelName] = null;
                }
                break;
            }

            default: {
                const Class = require(`./data/${className}`);
                if (this[camelId]) {
                    this[camelName] = await Class.get({id: this[camelId], unique: true});
                }
            }
        }
        
        if (!this[camelName] && options.required) {
            throw new Error(
                `Did not find expected ${StringFunctions.camelToSnakeCase(camelName).replace('_', ' ')}: id = ${this[camelId]}`
            );
        }
        
        return this[camelName];
    }

    // Get objects from their ultimate source (database or the Discord API)
    
    async getActivity          (options = {required: false}) { return await this.getObjectFromSource( 'activity',          options                ); }
    async getActivityCategory  (options = {required: false}) { return await this.getObjectFromSource( 'activityCategory',  options                ); }
    async getAlliance          (options = {required: false}) { return await this.getObjectFromSource( 'alliance',          options                ); }
    async getAuthor            (options = {required: false}) { return await this.getObjectFromSource( 'author',            options, 'Guardian'    ); }
    async getChannel           (options = {required: false}) { return await this.getObjectFromSource( 'channel',           options                ); }
    async getChannelGroup      (options = {required: false}) { return await this.getObjectFromSource( 'channelGroup',      options                ); }
    async getConfigChannel     (options = {required: false}) { return await this.getObjectFromSource( 'configChannel',     options, 'Channel'     ); }
    async getCreator           (options = {required: false}) { return await this.getObjectFromSource( 'creator',           options, 'Guardian'    ); }
    async getDiscordChannel    (options = {required: false}) { return await this.getObjectFromSource( 'discordChannel',    options                ); }
    async getDiscordGuild      (options = {required: false}) { return await this.getObjectFromSource( 'discordGuild',      options                ); }
    async getDiscordMessage    (options = {required: false}) { return await this.getObjectFromSource( 'discordMessage',    options                ); }
    async getUser              (options = {required: false}) { return await this.getObjectFromSource( 'user',              options,               ); }
    async getEvent             (options = {required: false}) { return await this.getObjectFromSource( 'event',             options                ); }
    async getGuardian          (options = {required: false}) { return await this.getObjectFromSource( 'guardian',          options                ); }
    async getGuild             (options = {required: false}) { return await this.getObjectFromSource( 'guild',             options                ); }
    async getJoinedFromChannel (options = {required: false}) { return await this.getObjectFromSource( 'joinedFromChannel', options, 'Channel'     ); }
    async getJoinedFromGuild   (options = {required: false}) { return await this.getObjectFromSource( 'joinedFromGuild',   options, 'Guild'       ); }
    async getOrigChannel       (options = {required: false}) { return await this.getObjectFromSource( 'origChannel',       options, 'Guild'       ); }
    async getOrigGuild         (options = {required: false}) { return await this.getObjectFromSource( 'origGuild',         options, 'Message'     ); }
    async getOrigMessage       (options = {required: false}) { return await this.getObjectFromSource( 'origMessage',       options                ); }
    async getUpdater           (options = {required: false}) { return await this.getObjectFromSource( 'updater',           options, 'Guardian'    ); }
    async getWebhook           (options = {required: false}) { return await this.getObjectFromSource( 'webhook',           options                ); }
    
    async getOwners(options = {required: false}) {
        const Guardian = require(`./data/Guardian.js`);
        const ownerIds = this.ownerIds;
        const owners = [];
        
        for (let o = 0; o < ownerIds.length; o++) {
            const owner = await Guardian.get({id: ownerIds[o], unique: true});
            if (owner) owners.push(owner);
        }
        
        return owners;
    }
    
    async getUserFriendlyId(options = {required: false}) {
        return await this.getObjectFromSource('userFriendlyId', options, 'UserFriendlyId', 'ufid');
    }
}
