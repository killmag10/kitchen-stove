"use strict";

var RowStatus = require('../Row/Status');

/**
 * Status object of the row.
 *
 * @class
 * @param {Object} data data to fill up
 */
var Result = function (data) {
    var self = this;

    Object.keys(data).forEach(function(key) {
        if (!(key in self)) {
            throw new TypeError('The property "' + key + '" does not exists on this object.');
        }
        self[key] = data[key];
    });
};

/**
 * Row status.
 * @type {RowStatus}
 */
Result.prototype.status = null;

/**
 * Version number of the row.
 * @type {Number}
 */
Result.prototype.version = null;

module.exports = Result;
