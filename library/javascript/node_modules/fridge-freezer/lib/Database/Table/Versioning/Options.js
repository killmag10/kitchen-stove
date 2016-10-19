"use strict";

var OptionsFieldNames = require('./Options/Field/Names');
var OptionsFieldDescriptions = require('./Options/Field/Descriptions');
var OptionsFieldTypes = require('./Options/Field/Types');

/**
 * Versioning Options
 */
var Options = function()
{
    this.fieldNames = new OptionsFieldNames();
    this.fieldDescriptions = new OptionsFieldDescriptions();

    this.startDate = new Date();
    this.dateTo = new Date().setFullYear(this.startDate.getFullYear() + 100);
};

/**
 * @type {OptionsFieldNames}
 */
Options.prototype.fieldNames = null;

/**
 * @type {OptionsFieldDescriptions}
 */
Options.prototype.fieldDescriptions = null;

/**
 * Database connection name.
 * @type {string}
 */
Options.prototype.database = null;

/**
 * Database schema if exists.
 * @type {string}
 */
Options.prototype.schema = null;

/**
 * Table name.
 * @type {string}
 */
Options.prototype.table = null;

/**
 * Commit size.
 * @type {number}
 */
Options.prototype.commitSize = 100;

/**
 * Purge not readed rows on the end.
 * @type {boolean}
 */
Options.prototype.purge = false;

/**
 * Additional purge condition
 * @type {string}
 */
Options.prototype.purgeWhere = null;

/**
 * Console compatible logger.
 * @type {console}
 */
Options.prototype.logger = null;

Options.FieldDescriptions = OptionsFieldDescriptions;
Options.FieldTypes = OptionsFieldTypes;

module.exports = Options;
