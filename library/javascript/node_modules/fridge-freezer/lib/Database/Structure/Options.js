/**
 * Database Strcuture Options
 *
 * @constructor
 */
var Options = function(){};

/**
 * @property {string} - changelog table create sql file
 */
Options.prototype.changelogSqlFile = __dirname + '/Structure.sql';

/**
 * @property {string} - the database name
 */
Options.prototype.database = null;

/**
 * @property {string} - SQL files directory
 */
Options.prototype.directory = null;

/**
 * @property {string} - name of database versioning meta table.
 */
Options.prototype.changelogName = 'changelog';

/**
 * @property {string|null} - current user name.
 */
Options.prototype.user = null;

/**
 * @property {string|null} - a logger object for logging like console (log, info, warn, error).
 * @see https://nodejs.org/api/console.html#console_console_log_data
 */
Options.prototype.logger = null;

module.exports = Options;
