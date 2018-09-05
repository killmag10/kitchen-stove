var util = require('util');
var events = require('events');

var SlaveConnectionManager = org.pentaho.di.cluster.SlaveConnectionManager;
var HttpClientManager = org.pentaho.di.core.util.HttpClientManager;
var ApacheUsernamePasswordCredentials =
    org.apache.http.auth.UsernamePasswordCredentials;

var JavaBufferedReader = java.io.BufferedReader;
var JavaInputStreamReader = java.io.InputStreamReader;
var JavaString = java.lang.String;
var JavaReflectArray = java.lang.reflect.Array;
var JavaLangByte = java.lang.Byte;

var ClientBodyProcessor = require('./Version4/Body/Processor.js');
var ClientResult = require('../Result.js');

var methods = {
    "GET": org.apache.http.client.methods.HttpGet,
    "POST": org.apache.http.client.methods.HttpPost,
    "PUT": org.apache.http.client.methods.HttpPut,
    "OPTIONS": org.apache.http.client.methods.HttpOptions,
    "HEAD": org.apache.http.client.methods.HttpHead,
    "TRACE": org.apache.http.client.methods.HttpTrace,
    "DELETE": org.apache.http.client.methods.HttpDelete,
    "PATCH": org.apache.http.client.methods.HttpPatch,
};

/**
 * A Http Client.
 * @exports Http/Client/Version/Version4
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
    var clientBuilder = HttpClientManager.getInstance().createBuilder();
    // Timeout
    if (params.timeout !== null) {
        clientBuilder.setSocketTimeout(params.timeout);
        clientBuilder.setConnectionTimeout(params.timeout);
    }
    // Credentials
    if (params.credentials) {
        clientBuilder.setCredentials(
            params.credentials.username,
            params.credentials.password
        );
    }
    // Proxy
    if (params.proxy) {
        apacheHttpClient.getHostConfiguration().setProxy(
            params.proxy.host,
            params.proxy.port
        );
    }
    var apacheHttpClient = clientBuilder.build();

    if (methods[params.method] === undefined) {
        throw new Error('Http method not found: ' + params.method);
    }

    var method = new methods[params.method](params.url);

    // Header
    for (var key in params.header) {
        method.setHeader(
            key,
            params.header[key]
        );
    }

    // Generate body
    ClientBodyProcessor.process(
        method,
        params
    );

    // Request
    client.emit('adapterRequest', apacheHttpClient, method);
    var result = apacheHttpClient.execute(method);
    client.emit('adapterResponse', apacheHttpClient, method);

    // Response
    var response = new ClientResult();
    response.statusCode = Number(result.getStatusLine().getStatusCode());
    response.charSet = result.getEntity().getContentEncoding();
    response.charSet = response.charSet === null ?
        'UTF-8' : String(response.charSet);

    result.getAllHeaders().forEach(function(header) {
        response.header[String(header.getName())] = String(header.getValue());
    });

    // Read body
    var bodyStream = result.getEntity().getContent();
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

    result.close();

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
                || e.javaException instanceof org.apache.http.ConnectionClosedException
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
