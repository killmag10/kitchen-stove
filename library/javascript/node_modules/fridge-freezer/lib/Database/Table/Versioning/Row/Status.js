"use strict";

/**
 * Row status types.
 * @type {Object}
 */
var RowStatus = {};

/**
 * Row is new.
 * @type {String}
 */
RowStatus.new = 'new';

/**
 * Row was found in a outdated version.
 * @type {String}
 */
RowStatus.outdated = 'outdated';

/**
 * Row was different and a new version must be written.
 * @type {String}
 */
RowStatus.changed = 'changed';

/**
 * Row was different and the current version must be updated.
 * @type {String}
 */
RowStatus.update = 'update';

/**
 * The row is identical. If set lastSeenDate will be updated.
 * @type {String}
 */
RowStatus.identical = 'identical';

/**
 * Row will be skiped completly.
 * @type {String}
 */
RowStatus.skiped = 'skiped';

/**
 * Current row version must be set to outdated.
 * @type {String}
 */
RowStatus.purged = 'purged';

module.exports = RowStatus;
