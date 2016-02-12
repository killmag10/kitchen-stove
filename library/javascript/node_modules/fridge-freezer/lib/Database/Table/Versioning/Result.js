"use strict";

var RowStatus = require('./Row/Status');

/**
 * Versioning result object.
 */
var Result = function(){};

/**
 * The current row.
 * @type {Object}
 */
Result.prototype.row = null;

/**
 * Version that was found/written.
 * @type {Number}
 */
Result.prototype.version = null;

/**
 * Date to value.
 * @type {Date}
 */
Result.prototype.dateTo = null;

/**
* Date from value.
* @type {Date}
 */
Result.prototype.dateFrom = null;

/**
 * Row status.
 * @type {RowStatus}
 */
Result.prototype.status = null;

module.exports = Result;
