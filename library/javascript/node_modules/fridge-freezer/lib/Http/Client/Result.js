/**
 * Http Client Result Object.
 * @exports Http/Client/Result
 * @constructor
 */
var Result = function() {};

/**
 * HTTP Status Code.
 * @type {Number}
 */
Result.prototype.statusCode = null;

/**
 * Response body.
 * @type {String|null}
 */
Result.prototype.body = null;

/**
 * Response headrt as key value object.
 * @type {Object}
 */
Result.prototype.header = {};

/**
 * A array of error objects.
 * @type {Array}
 */
Result.prototype.errors = [];

/**
 * Response char set.
 * @type {String}
 */
Result.prototype.charSet = null;

module.exports = Result;
