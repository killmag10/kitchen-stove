var Params = function(){
    var method = 'GET';

    Object.defineProperty(
        this, "method",
        {
            get: function (v) {
                return method;
            },
            set: function (v) {
                method = String(v).toUpperCase();
            }
        }
    );

};

Params.Credentials = require('./Params/Credentials.js');
Params.Proxy = require('./Params/Proxy.js');

Params.Methods = {
    "GET" : "GET",
    "POST" : "POST",
    "PUT" : "PUT",
    "OPTIONS" : "OPTIONS",
    "HEAD" : "HEAD",
    "TRACE" : "TRACE",
    "DELETE" : "DELETE",
    "PATCH" : "PATCH"
};

Params.prototype.url = null;
Params.prototype.timeout = null;
Params.prototype.method = 'get';

Params.prototype.header = {};
Params.prototype.body = null;
Params.prototype.encoding = null;
Params.prototype.retries = 0;

Params.prototype.credentials = null;
Params.prototype.proxy = null;

module.exports = Params;
