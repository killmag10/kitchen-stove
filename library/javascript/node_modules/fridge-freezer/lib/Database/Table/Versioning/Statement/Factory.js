"use strict";

/**
 * Creates prepared statements.
 * @param  {Object} options [description]
 */
var StatementFactory = function(options)
{
    this.cache = {};
    this.options = options;
};

/**
 * Get a prepared statement for the query and row data.
 *
 * @param  {org.pentaho.di.core.database.Database} database
 * @param  {Function} sqlCallback       A callback to get the query.
 * @param  {Array} fieldsList           List of field names to set from row object.
 * @param  {Object} row                 The data row.
 * @return {java:java.sql.PreparedStatement}
 */
StatementFactory.prototype.getStatement = function(database, sqlCallback, fieldsList, row)
{
    if(!sqlCallback.name) throw new ReferenceError('sqlCallback function has no name for caching');

    if(this.cache[sqlCallback.name] === undefined){
        var sql = sqlCallback();
        this.options.logger.log(sqlCallback.name + ':\n' + sql);
        this.cache[sqlCallback.name] = database.prepareSQL(sql);
    }

    var preparedStatement = this.cache[sqlCallback.name];
    preparedStatement.clearParameters();

    var fields = [];
    fieldsList.forEach(function(newList) {
        fields = fields.concat(newList);
    });

    fields.forEach(function(field, index) {
        preparedStatement.setObject(index + 1, row[field]);
    });

    return preparedStatement;
};

/**
 * Cleanup preparedStatement cache.
 */
StatementFactory.prototype.cleanup = function()
{
    var self = this;

    Object.keys(this.cache).forEach(function(key) {
        self.cache[key].close();
        delete self.cache[key];
    });
};

/**
 * Release all resources.
 */
StatementFactory.prototype.close = function()
{
    this.cleanup();
};

module.exports = StatementFactory;
