const r = require('rethinkdb');

/**
 * @class
 * @author Snake
 * @description rethinkdb database class
 */

class Database {
    /**
     * create instanse
     * @param {obejct} dbconfig
     * @param {string} dbconfig.host - database host
     * @param {number} dbconfig.port
     * @param {string} dbconfig.user
     * @param {string} dbconfig.password
     * @param {string} dbconfig.db
     */
     constructor(dbconfig, logger){
        let {
            host:host = 'localhost',
            port:port = 28015,
            user:user = 'admin',
            password:password = 'password',
            db:db = null
        } = dbconfig || {};

        this.innerLogger = {
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug
        };

        this.host = host;
        this.port = port;
        this.user = user;
        this.password = password;
        this.db = db;
        this.conn = {open: false};
        this.logger = (typeof(logger) == 'object' && typeof(logger.info) == 'function')
            ? logger : this.innerLogger;
     }

     /**
      * Connect to database
      * @author Snake
      */
     async connect(){
        this.logger.info('Try connect to database');
        try {
            this.conn = await r.connect({
                host: this.host,
                port: this.port,
                user: this.user,
                password: this.password,
                db: this.db
            });
            this.logger.info(`Connected`);
        } catch (error) {
            this.logger.error(`Error: ${error.message}`);
            this.logger.debug(error);
        }
     }
}

module.exports.Database = Database;
