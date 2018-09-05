
/**
 * Http Client Paramter Object.
 * @exports Http/Client/Params
 * @constructor
 */
var Params = function() {
    var method = 'GET';

    Object.defineProperty(
        this, "method",
        {
            get: function(v) {
                return method;
            },
            set: function(v) {
                method = String(v).toUpperCase();
            }
        }
    );

};

Params.Credentials = require('./Params/Credentials.js');
Params.Proxy = require('./Params/Proxy.js');

Params.Methods = {
    "GET": "GET",
    "POST": "POST",
    "PUT": "PUT",
    "OPTIONS": "OPTIONS",
    "HEAD": "HEAD",
    "TRACE": "TRACE",
    "DELETE": "DELETE",
    "PATCH": "PATCH"
};

/**
 * request url
 * @type {String}
 */
Params.prototype.url = null;

/**
 * Timeout in milliseconds.
 * @type {Number}
 */
Params.prototype.timeout = null;

/**
 * A method name like GET/POST (lowercase is posible)
 * @type {String}
 */
Params.prototype.method = 'get';

/**
 * A key value object of http headers to send.
 * @type {Object}
 */
Params.prototype.header = {};

/**
 * The body to send.
 * @type {String|Object|Http/Client/Entity}
 */
Params.prototype.body = null;

/**
 * Encoding to use. null = use header.
 * @type {String}
 */
Params.prototype.encoding = null;

/**
 * Max retries to do after a error.
 * @type {Number}
 */
Params.prototype.retries = 0;

/**
 * A credentials params object.
 *
 * {
 *  username: "",
 *  password: ""
 * }
 *
 * @type {Object}
 */
Params.prototype.credentials = null;

/**
 * A proxy params object.
 * @type {Object}
 */
Params.prototype.proxy = null;

module.exports = Params;
