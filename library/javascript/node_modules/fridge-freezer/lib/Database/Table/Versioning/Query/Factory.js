"use strict";

var simpleDateFormat = new java.text.SimpleDateFormat('yyyy-MM-dd HH:mm:ss');
var OptionFieldTypes = require('../Options/Field/Types');

/**
 * Create the sql querys.
 *
 * @class
 * @param  {Options} options Versioning Options.
 */
var QueryFactory = function(options)
{
    this.options = options;

    var escapefield = function escapefield(fields)
    {
        return '`' + fields.replace('`','\\`') + '`';
    };

    var getTablePath = function getTablePath()
    {
        if (this.options.schema) {
            return escapefield(this.options.schema) + '.' + escapefield(this.options.table);
        } else {
            return escapefield(this.options.table);
        }
    };

    var fieldsToString = function fieldsToString(fields,seperator)
    {
        var result = new Array();

        for (var key in fields) {
            result[key] = escapefield(fields[key]) + ' = ?';
        }

        return result.join(seperator);
    };

    var fieldsToSelectString = function fieldsToSelectString(fields,seperator)
    {
        var result = new Array();

        for (var key in fields) {
            result[key] = escapefield(fields[key]);
        }

        return result.join(seperator);
    };

    this.dateToValue = function dateToValue(date)
    {
        return simpleDateFormat.format(date);
    };

    this.getVersionSelect = function getVersionSelect()
    {
        return [
            'SELECT ' + escapefield(this.options.fieldNames.version) + ' FROM ',
            getTablePath(),
            'WHERE ' + fieldsToString(this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id), ' AND '),
            'ORDER BY ' + escapefield(this.options.fieldNames.version) + ' DESC ',
            'LIMIT 1'
        ].join('\n');
    };

    this.getActiveVersionSelect = function getActiveVersionSelect()
    {
        return [
            'SELECT * FROM ',
            getTablePath(),
            'WHERE ' + [].concat(
                fieldsToString(this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id), ' AND '),
                [
                    escapefield(this.options.fieldNames.dateFrom) + ' <= ?',
                    '( ' + escapefield(this.options.fieldNames.dateTo) + ' >= ? OR '
                        + escapefield(this.options.fieldNames.dateTo) + ' IS NULL )'
                ]
            ).join(' AND '),
            'LIMIT 1'
        ].join('\n');
    };

    this.getInsert = function getInsert()
    {
        var sql;
        var fields = new Array();
        fields = fields.concat(
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id),
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.update),
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.compare),
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.lazy),
            this.options.fieldNames.dateFrom,
            this.options.fieldNames.dateTo,
            this.options.fieldNames.version
        );
        if(this.options.fieldNames.dateLastSeen !== null) fields.push(this.options.fieldNames.dateLastSeen);

        return [
            'INSERT INTO '  + getTablePath() + " SET ",
            fieldsToString(fields, ', ')
        ].join('\n');
    };

    this.getUpdate = function getUpdate()
    {
        var sql;
        var fieldsSet = new Array();
        fieldsSet = fieldsSet.concat(
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.update),
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.lazy),
            this.options.fieldNames.dateFrom
        );
        if(this.options.fieldNames.dateLastSeen !== null) fieldsSet.push(this.options.fieldNames.dateLastSeen);

        var fieldsWhere = new Array();
        fieldsWhere = fieldsWhere.concat(
            this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id),
            this.options.fieldNames.version
        );

        return [
            'UPDATE '  + getTablePath() + " SET ",
            fieldsToString(fieldsSet, ', '),
            'WHERE ',
            fieldsToString(fieldsWhere, ' AND ')
        ].join('\n');
    };

    this.getUpdateOld = function getUpdateOld()
    {
        return [
            'UPDATE '  + getTablePath() + " SET ",
            escapefield(this.options.fieldNames.dateTo) + ' = ? ',
            'WHERE ',
            fieldsToString(this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id), ' AND '),
            'AND ( ' + escapefield(this.options.fieldNames.dateTo) + ' >= ? OR ',
            escapefield(this.options.fieldNames.dateTo) + ' IS NULL )'
        ].join('\n');
    };

    this.getUpdateLastSeen = function getUpdateLastSeen()
    {
        return [
            'UPDATE '  + getTablePath() + " SET ",
            escapefield(this.options.fieldNames.dateLastSeen) + ' = ? ',
            'WHERE ',
            fieldsToString(this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id), ' AND '),
            'AND ( ' + escapefield(this.options.fieldNames.dateTo) + ' >= ? OR ',
            escapefield(this.options.fieldNames.dateTo) + ' IS NULL )'
        ].join('\n');
    };

    this.getPurgeOne = function getPurgeOne()
    {
        return [
            'UPDATE '  + getTablePath() + " SET ",
            escapefield(this.options.fieldNames.dateTo) + ' = ?',
            'WHERE ',
            fieldsToString(this.options.fieldDescriptions.getFieldsByType(OptionFieldTypes.id), ' AND '),
            'AND ( ' + escapefield(this.options.fieldNames.dateTo) + ' >= ? OR ',
            escapefield(this.options.fieldNames.dateTo) + ' IS NULL )'
        ].join('\n');
    };

    this.getPurgeScope = function getPurgeScope()
    {
        var sql = [
            'UPDATE ' + getTablePath(),
            ' SET ' + escapefield(this.options.fieldNames.dateTo) + ' = ?',
            ' WHERE ( ' + escapefield(this.options.fieldNames.dateTo) + ' >= ? OR ',
            escapefield(this.options.fieldNames.dateTo) + ' IS NULL )',
            ' AND ' + escapefield(this.options.fieldNames.dateLastSeen) + ' < ?'
        ];
        if (this.options.purgeWhere) {
            sql.push(' AND (' + this.options.purgeWhere + ')');
        }

        return sql.join('\n');
    };
};

module.exports = QueryFactory;
