
// Load external classes
//const chalk  = require('chalk');
import chalk from 'chalk';
import moment from 'moment';

export default class Logger {
    static LOG_LEVEL_ERROR = 1;
    static LOG_LEVEL_WARN  = 2;
    static LOG_LEVEL_LOG   = 3;
    static LOG_LEVEL_CMD   = 4;
    static LOG_LEVEL_SQL   = 5;
    static LOG_LEVEL_DEBUG = 6;
    
    static map = new Map();
    
    static init() {
        Logger.map.set('ready'  , Logger.LOG_LEVEL_ERROR);
        Logger.map.set('error'  , Logger.LOG_LEVEL_ERROR);
        Logger.map.set('warn'   , Logger.LOG_LEVEL_WARN);
        Logger.map.set('log'    , Logger.LOG_LEVEL_LOG);
        Logger.map.set('cmd'    , Logger.LOG_LEVEL_CMD);
        Logger.map.set('sql'    , Logger.LOG_LEVEL_SQL);
        Logger.map.set('debug'  , Logger.LOG_LEVEL_DEBUG);
        Logger.map.set('dump'   , Logger.LOG_LEVEL_DEBUG);
        Logger.map.set('sqldump', Logger.LOG_LEVEL_SQL);
    }
    
    logLevelNum = Logger.LOG_LEVEL_LOG;
    
    get logLevel() {
        return this.logLevelNum;
    }
    
    set logLevel(value) {
        if (typeof value == 'string') {
            this.logLevelNum = Logger.map.get(value);
            if (!this.logLevelNum) {
                throw new RangeError(`Invalid log level: ${value}`);
            }
        } else {
            this.logLevelNum = value;
        }
    }
    
    log(content, type = 'log') {
        const timestamp  = `[${moment().format('YYYY-MM-DD HH:mm:ss')}]:`;
        let colorfulType;
        
        let logLevel = Logger.map.get(type);
        if (!logLevel) {
            throw new RangeError(`Invalid log level: ${type}`);
        }
        
        if (logLevel > this.logLevel) {
            return;
        }
        
        if (logLevel == Logger.LOG_LEVEL_SQL && !this.logSql) {
            return;
        }
        
        switch (type) {
            case 'ready'  : colorfulType = `${chalk.black.bgGreen  (type.toUpperCase()) }`; break;
            case 'error'  : colorfulType = `${chalk.bgRed          (type.toUpperCase()) }`; break;
            case 'warn'   : colorfulType = `${chalk.black.bgYellow (type.toUpperCase()) }`; break;
            case 'log'    : colorfulType = `${chalk.bgBlue         (type.toUpperCase()) }`; break;
            case 'cmd'    : colorfulType = `${chalk.black.bgWhite  (type.toUpperCase()) }`; break;
            case 'sql'    : colorfulType = `${chalk.green          (type.toUpperCase()) }`; break;
            case 'debug'  : colorfulType = `${chalk.green          (type.toUpperCase()) }`; break;
            case 'dump'   : colorfulType = ''; break;
            case 'sqldump': colorfulType = ''; break;
            case 'break'  : colorfulType = ''; break;
            default:
                throw new TypeError('Logger type must be either log, warn, error, debug, cmd, ready, dump, sqldump, or break.');
        }
        
        switch (type) {
            case 'dump'    :
            case 'sqldump' : return console.log(content);
            case 'break'   : return console.log();
            default        : return console.log(`${timestamp} ${colorfulType} ${content}`);
        }
    }

    ready   = (...args) => this.log(...args, 'ready'  );
    error   = (...args) => this.log(...args, 'error'  );
    warn    = (...args) => this.log(...args, 'warn'   );
    cmd     = (...args) => this.log(...args, 'cmd'    );
    sql     = (...args) => this.log(...args, 'sql'    );
    debug   = (...args) => this.log(...args, 'debug'  );
    dump    = (...args) => this.log(...args, 'dump'   );
    sqldump = (...args) => this.log(...args, 'sqldump');
    break   = (...args) => this.log(   null, 'break'  );
}

Logger.init();
