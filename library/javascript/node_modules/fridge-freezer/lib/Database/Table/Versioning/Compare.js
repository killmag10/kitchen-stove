"use strict";

var JavaInteger = java.lang.Integer;
var JavaLong = java.lang.Long;
var JavaDate = java.util.Date;
var JavaBigDecimal = java.math.BigDecimal;
var JavaDouble = java.lang.Double;
var JavaFloat = java.lang.Float;
var JavaMath = java.lang.Math;

var Options = require('./Options.js');
var Storage = require('./Storage.js');
var OptionFieldTypes = require('./Options/Field/Types');
var RowStatus = require('./Row/Status');
var CompareResult = require('./Compare/Result');

/**
 * Table Compare
 *
 * @param  {Options} options a Options object
 * @param  {Storage} storage a Storage object
 */
var Compare = function(options, storage) {
    var self = this;

    this.options = options;
    this.storage = storage;
};

Compare.prototype.compareValue = function(a, b) {
    if (a === null && b === null) {
        return true;
    }
    if (a === null || b === null) {
        return false;
    }

    if (
        a instanceof JavaFloat || a instanceof JavaDouble ||
        b instanceof JavaFloat || b instanceof JavaDouble
    ) {
        var ulp = JavaMath.max(
            JavaMath.ulp(a),
            JavaMath.ulp(b)
        );

        return JavaMath.abs(a - b) <= ulp;
    }

    if (a.compareTo(b) === 0) {
        return true;
    }

    return false;
};

Compare.prototype.compareRowCell = function(fieldName, rowA, rowB) {
    var a = rowA[fieldName];
    var b = rowB[fieldName];

    if (null !== a && null !== b) {
        if (a instanceof JavaInteger) {
            a = new JavaLong(a.longValue());
        }
        if (b instanceof JavaInteger) {
            b = new JavaLong(b.longValue());
        }

        switch (true) {
            case (a instanceof JavaBigDecimal && b instanceof JavaDouble):
                b = new JavaBigDecimal(b);
                break;
            case (a instanceof JavaDouble && b instanceof JavaBigDecimal):
                a = new JavaBigDecimal(a);
                break;
            case (a instanceof JavaDouble && b instanceof JavaFloat):
                a = new JavaFloat(a);
                break;
            case (a instanceof JavaFloat && b instanceof JavaDouble):
                b = new JavaFloat(b);
                break;
        }
    }

    try {
        return this.compareValue(a, b);
    } catch (e) {
        if (null !== a && null !== b && undefined !== a && undefined !== b) {
            if (!a.getClass().isInstance(b)) {
                throw new TypeError(
                    'Field type not equal for field "' + fieldName +
                    '" (class: ' + a.getClass().getName() + ' != ' +
                    b.getClass().getName()
                );
            }
        }
        throw e;
    }

};

/**
 * Compare the row with the database an get a result back.
 * @param  {Object} row     Date row.
 * @return {CompareResult}
 */
Compare.prototype.compareRow = function(row) {
    var status = null;
    var version = null;

    var databaseRow = this.storage.getActiveVersion(row);
    if (databaseRow !== null) {
        var fields;
        var fieldName;

        // Fix for InternalError: Can't find method java.lang.Long.valueOf().
        version = Number(String(databaseRow[options.fieldNames.version]));

        // Check if new version of the row must be written.
        fields = options.fieldDescriptions
            .getFieldsByType(OptionFieldTypes.compare);
        for (var key in fields) {
            fieldName = fields[key];
            if (!this.compareRowCell(fieldName, row, databaseRow)) {
                version++;
                return new CompareResult({
                    'status': RowStatus.changed,
                    'version': version
                });
            }
        }

        // Check if row must be updated.
        fields = options.fieldDescriptions
            .getFieldsByType(OptionFieldTypes.update);
        for (var key in fields) {
            fieldName = fields[key];
            if (!this.compareRowCell(fieldName, row, databaseRow)) {
                return new CompareResult({
                    'status': RowStatus.update,
                    'version': version
                });
            }
        }

        // No differences found. Row is identical.
        return new CompareResult({
            'status': RowStatus.identical,
            'version': version
        });
    }

    // No active version found search for outdated.
    databaseRow = this.storage.getVersion(row);
    if (databaseRow !== null) {
        // Fix for InternalError: Can't find method java.lang.Long.valueOf().
        version = Number(String(databaseRow[options.fieldNames.version]));
        return new CompareResult({
            'status': RowStatus.outdated,
            'version': ++version
        });

    }

    // No version found row must be new.
    return new CompareResult({
        'status': RowStatus.new,
        'version': 1
    });
};

/**
 * Close open resources.
 */
Compare.prototype.close = function() {
    this.storage.close();
};

module.exports = Compare;
