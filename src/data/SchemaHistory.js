
// Load our classes
import DatabaseTable from '../DatabaseTable.js';

// Load singletons
import client from '../Client.js';

export default class SchemaHistory extends DatabaseTable {
    static schema = this.parseSchema({
        tableName: 'schema_history',
        orderBy: ['log_date', 'object_type', 'object_name'],
        fields: {
            'log_date':    { type: 'date',                 nullable: false },
            'object_type': { type: 'string', length: 32,   nullable: false },
            'object_name': { type: 'string', length: 32,   nullable: false },
            'log_type':    { type: 'string', length: 16,   nullable: false },
            'status':      { type: 'string', length: 16,   nullable: false },
            'comment':     { type: 'string', length: 4000, nullable: true }
        },
        primaryKey: ['log_date', 'object_type', 'object_name']
    });
    
    static OBJECT_TYPE_TABLE       = 'table';
    static OBJECT_TYPE_FOREIGN_KEY = 'foreign-key';
    
    static LOG_TYPE_CREATE = 'create';
    static LOG_TYPE_ALTER  = 'alter';
    static LOG_TYPE_DELETE = 'delete';
    
    static STATUS_STARTED   = 'started';
    static STATUS_COMPLETED = 'completed';
    static STATUS_FAILED    = 'failed';
        
    constructor(data) {
        super(data);
    }
    
    // *********** //
    // * Getters * //
    // *********** //
    
    // No custom getters required
    
    // *********** //
    // * Setters * //
    // *********** //
    
    // No custom setters required
    
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
            if (status == SchemaHistory.STATUS_STARTED) {
                await log.create();
            } else {
                await log.update();
            }
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
