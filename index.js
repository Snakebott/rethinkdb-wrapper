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
     * @param {string} dbconfig.host database host
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
      */
     async open(){
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

            this.conn.on('error', (error)=>{
                this.logger.error(`database error: ${error.message}`);
                this.logger.debug(error);
            });

            this.conn.on('connect', ()=>{
                this.logger.info(`connected to database`);
            });

            this.conn.on('timeout', ()=>{
                this.logger.error(`database socker error`);
            });

            this.conn.on('close', ()=>{
                this.logger.info('database connection close');
            });

        } catch (error) {
            this.logger.error(`Error: ${error.message}`);
            this.logger.debug(error);
        }
    }

    /**
     * disconnect from database
     */
    async close(wait = true){
        this.logger.info(`Try disconnect from database`);
        try {
            await this.conn.close([{noreplyWait: wait}]);
        } catch (error) {
            this.logger.error(`Error: ${error.message}`);
            this.logger.debug(error);
        }
    }

    /**
     * force connection close
     */

    async forceClose(){
        await this.close(false);
    }

    /**
     * change default database
     * @param {string} db database name
     */
    async use(db){
        await this.conn.use(db);
        try {
            let info = await r.db(db).info().run(this.conn);
            this.logger.info(`database was changed to ${db}`);
            this.logger.debug(info);
            this.db = db;
        } catch (error) {
            this.logger.error(`Error: ${error.message}`);
            this.logger.debug(error);
        }
    }

    /** 
     * return table list
    */
    async tableList(){
        if(!this.db){
            this.logger.error('Error: getting table list error - database not selected');
            return false;
        }
        let TList = await r.db(this.db).tableList().run(this.conn);
        return TList;
    }

    /**
     * 
     * @param {object} reql REQL string
     */
    async select(reql){
        try {
            let cursor = await reql.run(this.conn);
            return await cursor.toArray();
        } catch (error) {
            this.logger.error(`Error: ${error.message}`);
            this.logger.error(error);
        }        
    }

    /**
     * read data from table
     * @param {string} table rethinkdb table
     * @param {number} limit limit result data
     */
    async read(table, limit = 0){
        if(!this.db){
            this.logger.error('Error: reading from table - database not selected');
            return false;
        }
        let reql = (limit > 0)? r.db(this.db).table(table).limit(limit) 
            : r.db(this.db).table(table);
        let cursor = await reql.run(this.conn);
        return cursor.toArray();
    }
}

module.exports.Database = Database;
