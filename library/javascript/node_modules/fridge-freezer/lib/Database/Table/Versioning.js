"use strict";

var JavaDate = java.util.Date;
var JavaInteger = java.lang.Integer;
var JavaLong = java.lang.Long;

var Options = require('./Versioning/Options');
var OptionFieldTypes = require('./Versioning/Options/Field/Types');
var Result = require('./Versioning/Result');
var Storage = require('./Versioning/Storage');
var Statistic = require('./Versioning/Statistic');
var RowStatus = require('./Versioning/Row/Status');
var Compare = require('./Versioning/Compare');

/**
 * Table Versioning
 *
 * @param  {Options} options a Options object
 */
var Versioning = function(options)
{
    var self = this;

    this.options = options;
    this.storage = new Storage(this.options);
    this.compare = new Compare(this.options, this.storage);

    /**
     * The statistic logger.
     * @type {Statistic}
     */
    this.statistic = new Statistic(this);

    if (options.purge && options.fieldNames.dateLastSeen === null) {
        throw new Error('Option dateLastSeen must be set for purging!');
    }

    /**
     * Write changes to the database.
     *
     * @param  {Object} row           the current data row
     * @param  {[type]} compareResult
     * @return {[type]}               [description]
     */
    this.updateDatabase = function(row, compareResult)
    {
        var status = compareResult['status'];
        var version = compareResult['version'];

        row[options.fieldNames.version] = new JavaInteger(version);
        row[options.fieldNames.dateTo] = (options.dateTo === null) ? null : new JavaDate(options.dateTo);
        row[options.fieldNames.dateFrom] = new JavaDate(options.startDate);
        if(options.fieldNames.dateLastSeen !== null) {
            row[options.fieldNames.dateLastSeen] = row[options.fieldNames.dateFrom];
        }

        switch(status.valueOf()){
            case RowStatus.identical:
                if(options.fieldNames.dateLastSeen !== null) {
                    this.storage.addRowBackup(row);
                    this.storage.updateLastSeen(row);
                }
                break;
            case RowStatus.new:
            case RowStatus.outdated:
                this.storage.addRowBackup(row);
                this.storage.insertVersion(row);
                break;
            case RowStatus.changed:
                this.storage.addRowBackup(row);
                this.storage.changedVersion(row);
                break;
            case RowStatus.update:
                this.storage.addRowBackup(row);
                this.storage.updateVersion(row);
                break;
            case RowStatus.purged:
                this.storage.addRowBackup(row);
                this.storage.purgeOne(row);
                break;
            case RowStatus.skiped:
                break;
            default:
                throw new ReferenceError('Status "' + status.valueOf() + '" not allowed');
                break;
        }

        return row;
    };

    /**
     * Process one row.
     *
     * @param  {Versioning}             self    The current versioning object.
     * @param  {Object}                 row     A object with key as table field name.
     * @param  {RowStatus}    status  Force the versioning to process the row with this status if it was set.
     * @return {Result}     A result object.
     */
    var process = function(self, row, status) {

        try {
            row[options.fieldNames.dateTo] = new JavaDate();
            row[options.fieldNames.dateFrom] = row[options.fieldNames.dateTo];

            var compareResult = self.compare.compareRow(row);
            switch (status) {
                case RowStatus.identical:
                case RowStatus.purged:
                    if (compareResult.status.valueOf() === RowStatus.new || result.status.valueOf() === RowStatus.outdated){
                        compareResult.status = RowStatus.skiped;
                    } else {
                        compareResult.status = status;
                    }
                    break;
            }
            var resultRow = self.updateDatabase(row, compareResult);

            var versioningResult = new Result();
            versioningResult.row = resultRow;
            versioningResult.version = Number(compareResult.version);
            versioningResult.dateTo =
                row[self.options.fieldNames.dateTo] !== null
                    ? new Date(row[self.options.fieldNames.dateTo].getTime())
                    : null;
            versioningResult.dateFrom =
                row[self.options.fieldNames.dateFrom] !== null
                    ? new Date(row[self.options.fieldNames.dateFrom].getTime())
                    : null;
            versioningResult.status = compareResult.status;

            self.statistic.incrementStatus(versioningResult.status);

            return versioningResult;

        } catch(e) {
            var rollbackResult = self.storage.rollback(e);

            if (!(
                rollbackResult && (
                    e.javaException instanceof java.sql.SQLException
                    || e.javaException instanceof org.pentaho.di.core.exception.KettleDatabaseException
                )
            )) {
                self.close();
                throw e;
            }
        }

        return null;
    };

    /**
     * Process one row
     *
     * Syncronize row with database table.
     *
     * @param  {Object} row     A object with key as table field name.
     * @return {Result}         A result object.
     */
    this.process = function(row)
    {
        return process(this, row, null);
    };

    /**
     * Process this row as identical. Updates only dateLastSeen.
     *
     * @param  {Object} row     A object with key as table field name.
     * @return {Result}         A result object.
     */
    this.processAsIdentical = function(row)
    {
        return process(this, row, RowStatus.identical);
    };

    /**
     * Process this row as deleted.
     *
     * Only id fields must be filled.
     *
     * @param  {Object} row     A object with key as table field name.
     * @return {Result}         A result object.
     */
    this.processAsPurged = function(row)
    {
        return process(this, row, RowStatus.purged);
    };
};

Versioning.prototype.processAs = function(row, status)
{
    switch (status.valueOf()) {
        case null:
            return this.processRow(row);
            break;
        case RowStatus.identical:
            return this.processRowAsIdentical(row);
            break;
        case RowStatus.purged:
            return this.processRowAsPurged(row);
            break;
        default:
            throw new ReferenceError('Status "' + status.valueOf() + '" not allowed');
            break;
    }
};

Versioning.prototype.purge = function()
{
    try {
        var count = this.storage.purge(
            new JavaDate(this.options.startDate),
            this.options.purgeWhere
        );
        this.statistic.addUpdated(count);
    } catch(e) {
        this.storage.rollback(e);
        this.close();
        throw e;
    }
};

Versioning.prototype.setRollbackCallback = function(callback){
    this.storage.rollbackCallback = callback;
};

/**
 * Must be called on the end of the versioning to cleanup some stuff.
 */
Versioning.prototype.finish = function(){
    if (this.options.purge) {
        this.purge();
    }
    this.storage.commit();
    this.close();
};

/**
 * Close open resources with syncronizing.
 *
 * Not needet if finish was called.
 */
Versioning.prototype.close = function(){
    this.storage.close();
};

Versioning.convertRow = function(row, rowMeta){
    var result = new Object();

    for(var key = 0; key < rowMeta.size(); key++){
        var valueMeta = rowMeta.getValueMeta(key);
        result[valueMeta.getName()] = row[key];
    }

    return result;
};
Versioning.convertRowBack = function(row, rowMeta){
    var result = new Array(row.length);

    for(var key = 0; key < rowMeta.size(); key++){
        var valueMeta = rowMeta.getValueMeta(key);
        result[key] = row[valueMeta.getName()];
    }

    return result;
};

Versioning.RowStatus = RowStatus;
Versioning.Options = Options;

module.exports = Versioning;
