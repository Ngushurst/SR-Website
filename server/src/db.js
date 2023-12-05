const fs = require('fs');
const mysql = require('mysql');
const util = require('util');
const config = JSON.parse(fs.readFileSync(process.cwd() + '/config.json'));

let db, dbquery;

/**
 * Establishes a connection to a mysql database specified in config.js.
 * Creates two objects: db and dbquery.
 * db can be used to generate a connection that can be re-used in the code.
 *   db.getConnection(async (err, connection) => {
 *     if (err) {...}
 *     else {
 *       dbq = util.promisify(connection.query).bind(connection);
 *       await dbq(query_string, [arguments]);
 *       connection.release();
 *     }
 *   });
 *   This connection is asyncronous and does not return anything directly. An output can be extracted from it by
 *   wrapping it in a promise (await new promise((resolve)=> {db.getConnection(...)})) and setting an external
 *   variable within the callback with the connection or returning something with resolve.
 *   While it requires more work, queries made within the callback will all occur in the same
 *   connection, allowing more complex queries and sql transactions.
 *   
 * dbquery can be used to quickly make individual database queries with the syntax:
 *   await dbquery(query_string, [arguments]);
 *   It should be noted that calls to dbquery are completely asynchronous,
 *   and cannot be counted upon to happen in the order that they are called.
 *   dbquery is additionally prone to error at any time. Always wrap calls in try/catch statements.
 *   
 * See the official documentation for a more complete explanation of what all the parameters do:
 * https://www.npmjs.com/package/mysql
 * */
function connect() {
  if (!db) { // Only run if a connection hasn't been established with the database.
    // Required parameters for the connection.
    let params = {
      host: config.db.host,
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      connectionLimit: 10, // max number of connections allowed by the pool at a time.
    }
    // Other parameters that can be accepted. The default parameters should be serviceable.
    if (config.db.acquireTimeout) params.acquireTimeout = config.db.acquireTimeout; // Defaults to 10,000 (miliseconds) (time for aquiring pool)
    if (config.db.connectionTimeout) params.connectionTimeout = config.db.connectionTimeout; // Defaults to 10,000 (miliseconds) (time for aquiring database connection)
    if (config.db.debug) params.debug = config.db.debug; // default: false (if true, prints extra information to the console)
    if (config.db.flags) params.flags = config.db.flags; // default: (see https://www.npmjs.com/package/mysql#connection-flags)
    if (config.db.port) params.port = config.db.port; // default: 3306
    if (config.db.queueLimit) params.queueLimit = config.db.queueLimit; // default: 0 (no limit) (max number of queries that can be waiting for a connection without error)
    if (config.db.timezone) params.timezone = config.db.timezone; // default: 'local'
    if (config.db.trace) params.trace = config.db.trace; // default: true (generates stack traces on error as an output)
    if (config.db.ssl) params.ssl = config.db.ssl; // default: null (see https://www.npmjs.com/package/mysql#ssl-options)

    // Create database pool (allows creation of connections, and is much more resillient )
    db = mysql.createPool(params);
    // Promisify the connection for one-off queries. Creates a new connection for the query and closes it afterwards.
    dbquery = util.promisify(db.query).bind(db);
  }
  return { db, dbquery };
}

module.exports = connect();