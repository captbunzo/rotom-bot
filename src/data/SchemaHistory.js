
import client from '#src/Client.js';
import DatabaseTable from '#src/types/DatabaseTable.js';

export default class SchemaHistory extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'schema_history',
        orderBy: ['created_at'],
        fields: {
            'log_date':    { type: 'date',                 nullable: false },
            'object_type': { type: 'string', length: 32,   nullable: false },
            'object_name': { type: 'string', length: 32,   nullable: false },
            'log_type':    { type: 'string', length: 16,   nullable: false },
            'status':      { type: 'string', length: 16,   nullable: false },
            'comment':     { type: 'string', length: 4000, nullable: true }
        },
        primaryKey: ['created_at', 'object_type', 'object_name', 'log_type', 'status']
    });
    
    static OBJECT_TYPE_TABLE       = 'TABLE';
    static OBJECT_TYPE_FOREIGN_KEY = 'FOREIGN-KEY';
    
    static LOG_TYPE_CREATE = 'CREATE';
    static LOG_TYPE_ALTER  = 'ALTER';
    static LOG_TYPE_DELETE = 'DELETE';
    
    static STATUS_STARTED   = 'START';
    static STATUS_COMPLETED = 'COMPLETE';
    static STATUS_FAILED    = 'FAIL';
        
    constructor(data) {
        super(data);
    }
    
    // *********** //
    // * Getters * //
    // *********** //
    
    get logDate() {
        this.validateFieldName('logDate');
        return new Date(this.data['log_date']);
    }

    get logType    () { return this.getField('logType'); }
    get objectName () { return this.getField('objectName'); }
    get objectType () { return this.getField('objectType'); }
    get status     () { return this.getField('status'); }
    get comment    () { return this.getField('comment'); }
    
    // *********** //
    // * Setters * //
    // *********** //
    
    set logDate    (value) { this.setField('logDate', value); }
    set logType    (value) { this.setField('logType', value); }
    set objectName (value) { this.setField('objectName', value); }
    set objectType (value) { this.setField('objectType', value); }
    set status     (value) { this.setField('status', value); }
    set comment    (value) { this.setField('comment', value); }

    /**
     * Get schema histories based on a given set of conditions in an optional order.
     * @param {object} [conditions] The criteria for the schema histories to retrieve
     * @param {object} [orderBy] The order in which the schema histories will be returned
     * @returns {Promise<SchemaHistory|SchemaHistory[]>} The schema histories retrieved
     */
    static async get(conditions = {}, orderBy = this.schema.orderBy) {
        return await super.get(conditions, orderBy);
    }

    // ***************** //
    // * Class Methods * //
    // ***************** //
    
    static parseConditions(conditions) {
        if (conditions.matchNewerHistory) {
            return (query) => {
                query.where('object_type', conditions.objectType)
                  .andWhere('object_name', conditions.objectName)
                  .andWhere('log_date', '>=', conditions.logDate);
            };
        }
        
        return conditions;
    }
    
    static async log(
        objectType,
        objectName,
        logType,
        status,
        comment,
        logDate = new Date()
    ) {
        const logData = {
            logDate: logDate,
            objectType: objectType,
            objectName: objectName,
            logType: logType,
            status: status,
            comment: comment
        };
        const log = new SchemaHistory(logData);
        
        if (objectType == SchemaHistory.OBJECT_TYPE_TABLE && objectName == SchemaHistory.schema.tableName) {
            if (status != SchemaHistory.STATUS_COMPLETED) return;
            await log.create();
        } else {
            await log.create();
        }
    }
    
    static async logCreateTable(tableName, status, comment, logdate) {
        if (status == SchemaHistory.STATUS_STARTED) {
            client.logger.log(`  -> Creating table: ${client.colorizeTable(tableName)}`);
        }
        
        await SchemaHistory.log(
            SchemaHistory.OBJECT_TYPE_TABLE, tableName, SchemaHistory.LOG_TYPE_CREATE, status, comment, logdate
        );
    }
    
    static async logAlterTable(tableName, status, comment, logdate) {
        if (status == SchemaHistory.STATUS_STARTED) {
            client.logger.log(`  -> Altering table: ${client.colorizeTable(tableName)}`);
        }
        
        await SchemaHistory.log(
            SchemaHistory.OBJECT_TYPE_TABLE, tableName, SchemaHistory.LOG_TYPE_ALTER, status, comment, logdate
        );
    }
    
    static async logDeleteTable(tableName, status, comment, logdate) {
        if (status == SchemaHistory.STATUS_STARTED) {
            client.logger.log(`  -> Deleting table: ${client.colorizeTable(tableName)}`);
        }
        
        await SchemaHistory.log(
            SchemaHistory.OBJECT_TYPE_TABLE, tableName, SchemaHistory.LOG_TYPE_DELETE, status, comment, logdate
        );
    }
    
    // ******************** //
    // * Instance Methods * //
    // ******************** //
    
    async create() {
        await DatabaseTable.prototype.create.call(this);
    }
    
    async update(condition = {log_date: this.logDate, object_name: this.objectName, object_type: this.objectType}) {
        await DatabaseTable.prototype.update.call(this, condition);
    }
    
    async delete(condition = {log_date: this.logDate, object_name: this.objectName, object_type: this.objectType}) {
        await DatabaseTable.prototype.delete.call(this, condition);
    }
}
