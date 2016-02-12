"use strict";

/**
 * Field types.
 * @type {Object}
 */
var OptionsFieldTypes = {};

/**
 * Is a identifier field.
 * @type {String}
 */
OptionsFieldTypes.id = 'id';

/**
 * Compare the field to check if it is a new version.
 * @type {String}
 */
OptionsFieldTypes.compare = 'compare';

/**
 * Compare the field put only update the last version.
 * @type {String}
 */
OptionsFieldTypes.update = 'update';

/**
 * Write the field only if a new version was written and don't compare it.
 * @type {String}
 */
OptionsFieldTypes.lazy = 'lazy';

/**
 * Ignore this field completly.
 * @type {String}
 */
OptionsFieldTypes.ignore = 'ignore';

module.exports = OptionsFieldTypes;
