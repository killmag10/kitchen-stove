"use strict";

var StatementFactory = require('./Statement/Factory.js');
var QueryFactory = require('./Query/Factory.js');
var OptionFieldTypes = require('./Options/Field/Types');

var VersioningStorage = function(options)
{
    var self = this;
    this.options = options;

    var uncommitedCount = 0;

    var PentahoDatabase = org.pentaho.di.core.database.Database;
    var queryFactory = new QueryFactory(this.options);
    var preparedStatementFactory = new StatementFactory(this.options);

    var connect = function() {
        self.database && self.database.disconnect();
        self.database = new PentahoDatabase(_step_.getTransMeta().findDatabase(self.options.database));
        self.database.connect();
        self.database.setAutoCommit(false);
        preparedStatementFactory.cleanup();
    };
    connect();

    this.uncommitedRows = [];
    this.clearRowBackup = function()
    {
        this.uncommitedRows = [];
    };

    this.rollbackRowBackup = function(error)
    {
        var result = false;

        if (null !== self.rollbackCallback) {
            result = self.rollbackCallback(error, this.uncommitedRows);
        }
        this.clearRowBackup();

        return result;
    };

    this.addRowBackup = function(row)
    {
        this.uncommitedRows.push(row);
    };

    this.close = function(){
        preparedStatementFactory.close();
        this.database && this.database.disconnect();
    };

    var commitReady = function(){
        uncommitedCount++;
        if (uncommitedCount >= self.options.commitSize) {
            self.commit();
        }
    };

    this.commit = function(){
        this.database.commit();
        uncommitedCount = 0;
        this.clearRowBackup();
        //preparedStatementFactory.cleanup();
    };

    this.rollback = function(error){
        if (this.database) {
            if( this.database.getConnection().isClosed() ) {
                connect();
            } else {
                this.database.rollback();
            }
        }
        uncommitedCount = 0;
        return this.rollbackRowBackup(error);
    };

    var resultSetRowToObject = function(resultSet)
    {
        var result = {};
        for(var i=1; i <= resultSet.getMetaData().getColumnCount(); i++){
            var columnName = resultSet.getMetaData().getColumnName(i);
            result[columnName] = resultSet.getObject(i);
        }

        return result;
    };

    this.getVersion = function(row)
    {

        var preparedStatement = preparedStatementFactory.getStatement(
            this.database,
            queryFactory.getVersionSelect,
            [
                this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id),
            ],
            row
        );
        var resultVersion = preparedStatement.executeQuery();

        var result = null;
        if (resultVersion.next()) {
            result = resultSetRowToObject(resultVersion);
        }
        resultVersion.close();

        return result;
    };

    this.getActiveVersion = function(row)
    {
        var preparedStatement = preparedStatementFactory.getStatement(
            this.database,
            queryFactory.getActiveVersionSelect,
            [
                this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id),
                this.options.fieldNames.dateFrom,
                this.options.fieldNames.dateTo
            ],
            row
        );

        var resultVersion = preparedStatement.executeQuery();

        var result = null;
        if (resultVersion.next()) {
            result = resultSetRowToObject(resultVersion);
        }
        resultVersion.close();

        return result;
    };

    this.changedVersion = function(row)
    {
        var preparedStatement = preparedStatementFactory.getStatement(
            this.database,
            queryFactory.getUpdateOld,
            [
                this.options.fieldNames.dateFrom,
                this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id),
                this.options.fieldNames.dateFrom
            ],
            row
        );

        preparedStatement.execute();

        this.insertVersion(row);
    };

    this.insertVersion = function(row)
    {
        var fields = [
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id),
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.update),
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.compare),
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.lazy),
            this.options.fieldNames.dateFrom,
            this.options.fieldNames.dateTo,
            this.options.fieldNames.version
        ];
        if(this.options.fieldNames.dateLastSeen !== null) fields.push(this.options.fieldNames.dateLastSeen);

        var preparedStatement = preparedStatementFactory.getStatement(
            this.database,
            queryFactory.getInsert,
            fields,
            row
        );

        preparedStatement.execute();
        commitReady();
    };

    this.updateVersion = function(row)
    {
        var fields = new Array();
        fields = [
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.update),
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.lazy),
            this.options.fieldNames.dateFrom,
        ];
        if(this.options.fieldNames.dateLastSeen !== null) fields.push(this.options.fieldNames.dateLastSeen);
        fields = fields.concat(
        	this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id),
        	this.options.fieldNames.version
        );

        var preparedStatement = preparedStatementFactory.getStatement(
            this.database,
            queryFactory.getUpdate,
            fields,
            row
        );

        preparedStatement.execute();
        commitReady();
    };

    this.updateLastSeen = function(row)
    {
        var preparedStatement = preparedStatementFactory.getStatement(
            this.database,
            queryFactory.getUpdateLastSeen,
            [
                this.options.fieldNames.dateLastSeen,
                this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id),
                this.options.fieldNames.dateFrom
            ],
            row
        );

        preparedStatement.execute();
        commitReady();
    };

    this.purgeOne = function(row)
    {
        var preparedStatement = preparedStatementFactory.getStatement(
            this.database,
            queryFactory.getPurgeOne,
            [
                this.options.fieldNames.dateFrom,
                this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id),
                this.options.fieldNames.dateFrom
            ],
            row
        );

        preparedStatement.execute();
        commitReady();
    };

    this.purge = function(date, purgeWhere)
    {
        var preparedStatement = preparedStatementFactory.getStatement(
            this.database,
            queryFactory.getPurgeScope,
            [
                'date',
                'date',
                'date'
            ],
            {
                date: date,
            }
        );
        preparedStatement.execute();
        self.commit();
        return preparedStatement.getUpdateCount();
    };
};

/**
 * Callback for rollback.
 * @type {Function}
 */
VersioningStorage.prototype.rollbackCallback = null;

module.exports = VersioningStorage;
