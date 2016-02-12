"use strict";

/**
 * Names of the versioning fields in the database.
 *
 * @class
 */
var OptionsFieldsNames = function(){};

/**
 * Date to field name.
 * @type {String}
 */
OptionsFieldsNames.prototype.dateTo = 'dateTo';

/**
 * Date from field name.
 * @type {String}
 */
OptionsFieldsNames.prototype.dateFrom = 'dateFrom';

/**
 * Date last seen field name.
 * @type {String}
 */
OptionsFieldsNames.prototype.dateLastSeen = null;

/**
 * Version field name.
 * @type {String}
 */
OptionsFieldsNames.prototype.version = 'version';

module.exports = OptionsFieldsNames;
