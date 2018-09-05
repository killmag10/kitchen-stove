var util = require('util');
var events = require('events');

var SlaveConnectionManager = org.pentaho.di.cluster.SlaveConnectionManager;

var ApacheHttpClient = org.apache.commons.httpclient.HttpClient;
var ApacheMethodGet = org.apache.commons.httpclient.methods.GetMethod;
var ApacheMethodPost = org.apache.commons.httpclient.methods.PostMethod;
var ApacheMethodPut = org.apache.commons.httpclient.methods.PutMethod;
var ApacheMethodHead = org.apache.commons.httpclient.methods.HeadMethod;
var ApacheMethodOptions = org.apache.commons.httpclient.methods.OptionsMethod;
var ApacheMethodTrace = org.apache.commons.httpclient.methods.TraceMethod;
var ApacheMethodDelete = org.apache.commons.httpclient.methods.DeleteMethod;

var ApacheUsernamePasswordCredentials = org.apache.commons.httpclient.UsernamePasswordCredentials
var ApacheAuthScope = org.apache.commons.httpclient.auth.AuthScope;

var ApacheParams = org.apache.commons.httpclient.params.HttpClientParams

var JavaBufferedReader = java.io.BufferedReader;
var JavaInputStreamReader = java.io.InputStreamReader;
var JavaString = java.lang.String;
var JavaReflectArray = java.lang.reflect.Array
var JavaLangByte = java.lang.Byte;

var ClientBodyProcessor = require('../Body/Processor.js');
var ClientResult = require('../Result.js');

var ApacheMethodPatch = function(uri) {
    return JavaAdapter(
        ApacheMethodPut,
        {
            "getName" : function() {
                return 'PATCH';
            }
        },
        uri
    );
};

var methods = {
    "GET" : ApacheMethodGet,
    "POST" : ApacheMethodPost,
    "PUT" : ApacheMethodPut,
    "OPTIONS" : ApacheMethodOptions,
    "HEAD" : ApacheMethodHead,
    "TRACE" : ApacheMethodTrace,
    "DELETE" : ApacheMethodDelete,
    "PATCH" : ApacheMethodPatch
};

/**
 * A Http Client.
 * @exports Http/Client/Version/Version3
 * @constructor
 */
var Client = function() {
    events.EventEmitter.call(this);
};
util.inherits(Client, events.EventEmitter);

Client.Params = require('../Params.js');

/**
 * [description]
 * @param {Http/Client} client the HTTP Client instance
 * @param {Http/Client/Params} params a HTTP Client Params object
 * @return {Http/Client/Result} a HTTP Client Result object
 */
var request = function(client, params) {
    var apacheHttpClient = SlaveConnectionManager
        .getInstance().createHttpClient();

    if (methods[params.method] === undefined) {
        throw new Error('Http method not found: ' + params.method);
    }

    var method = new methods[params.method](params.url);

    // Header
    for (var key in params.header) {
        method.setRequestHeader(
            key,
            params.header[key]
        );
    }

    // Timeout
    if (params.timeout !== null) {
        apacheHttpClient.setTimeout(params.timeout);
        apacheHttpClient.setConnectionTimeout(params.timeout);
    }

    // Credentials
    if (params.credentials) {
        apacheHttpClient.getState().setCredentials(
            ApacheAuthScope.ANY,
            new ApacheUsernamePasswordCredentials(
                params.credentials.username,
                params.credentials.password
            )
        );
        apacheHttpClient.getParams().setAuthenticationPreemptive(true);
    }

    // Proxy
    if (params.proxy) {
        apacheHttpClient.getHostConfiguration().setProxy(
            params.proxy.host,
            params.proxy.port
        );
    }

    // Generate body
    ClientBodyProcessor.process(
        method,
        params
    );

    // Request
    client.emit('adapterRequest', apacheHttpClient, method);
    var result = apacheHttpClient.executeMethod(method);
    client.emit('adapterResponse', apacheHttpClient, method);

    // Response
    var response = new ClientResult();
    response.statusCode = Number(method.getStatusCode());
    response.charSet = String(method.getResponseCharSet());

    method.getResponseHeaders().forEach(function(header) {
        response.header[String(header.getName())] = String(header.getValue());
    });

    // Read body
    var bodyStream = method.getResponseBodyAsStream();
    if (bodyStream !== null) {
        var buffer = JavaReflectArray.newInstance(
            JavaLangByte.TYPE,
            65536
        );

        var bodyLine;
        var bytesRead;
        response.body = '';
        while ((bytesRead = bodyStream.read(buffer, 0, 65536)) > 0) {
            response.body += String(
                new JavaString(
                    buffer,
                    0,
                    bytesRead,
                    params.encoding === null ?
                        response.charSet : params.encoding
                )
            );
        }

        bodyStream.close();
    }

    method.releaseConnection();

    return response;
};

/**
 * Do a http request.
 * @param {Http/Client/Params} params a HTTP Client Params object
 * @return {Http/Client/Result} a HTTP Client Result object
 */
Client.prototype.request = function(params) {
    var retries = params.retries;
    var errors = [];

    while (retries >= 0) {
        retries--;

        try {
            var result = request(this, params);
            result.errors = errors;
            return result;
        } catch (e) {
            this.emit("warning", e, params);

            errors.push(e);

            if (retries <= 0) {
                throw e;
            }

            if (!(
                e.javaException instanceof java.net.SocketTimeoutException
                || e.javaException instanceof java.net.ProtocolException
                || e.javaException instanceof java.net.UnknownHostException
                || e.javaException instanceof javax.net.ssl.SSLException
                || e.javaException instanceof org.apache.commons.httpclient.ProtocolException
                || e.javaException instanceof org.apache.commons.httpclient.ConnectTimeoutException
            )) {
                throw e;
            }
        }
    }
};

/**
 * Close all resources.
 */
Client.prototype.close = function() {};

module.exports = Client;
