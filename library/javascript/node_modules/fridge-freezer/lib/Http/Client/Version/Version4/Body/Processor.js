var EntityString = require('./../../../Entity/String.js');
var EntityMultipart = require('./../../../Entity/Multipart.js');
var EntityFile = require('./../../../Entity/File.js');

var StringBody = org.apache.http.entity.mime.content.StringBody;
var FileBody = org.apache.http.entity.mime.content.FileBody;
var ContentType = org.apache.http.entity.ContentType;
var StringEntity = org.apache.http.entity.StringEntity;
var FileEntity = org.apache.http.entity.FileEntity;
var MultipartEntityBuilder = org.apache.http.entity.mime.MultipartEntityBuilder;

var ApacheMethodParams =
    org.apache.commons.httpclient.params.HttpMethodParams;
var ApacheMultipartRequestEntity =
    org.apache.commons.httpclient.methods.multipart.MultipartRequestEntity;
var ApacheFileRequestEntity =
    org.apache.commons.httpclient.methods.FileRequestEntity;
var ApacheStringRequestEntity =
    org.apache.commons.httpclient.methods.StringRequestEntity;

var JavaFile = java.io.File;
var JavaByteArrayOutputStream = java.io.ByteArrayOutputStream;

var Processor = {};

/**
 * Generate a multipart part entity.
 * @param {Http/Client/Params.body} body a Http Client Params body object.
 */
var getMultipartPart = function(body) {
    if (body.getType && EntityString.getType() === body.getType()) {
        return new StringBody(
            body.toString(),
            ContentType.create(
                body.contentType,
                body.transferEncoding
            )
        );
    }

    if (body.getType && EntityFile.getType() === body.getType()) {
        return new FileBody(
            new JavaFile(body.toString()),
            ContentType.create(
                body.contentType,
                body.transferEncoding
            )
        );
    }

    return null;
};

/**
 * Generate a body content entity.
 * @param {Http/Client/Params.body} body a Http Client Params body object.
 */
var getEntity = function(body) {
    if (body.getType && EntityMultipart.getType() === body.getType()) {
        var multipartEntityBuilder = MultipartEntityBuilder.create();
        for (var key in body.parts) {
            if (body.parts[key] !== null) {
                multipartEntityBuilder.addPart(
                    String(key),
                    getMultipartPart(
                        body.parts[key],
                        key
                    )
                );
            }
        }

        return multipartEntityBuilder.build();
    }

    if (body.getType && EntityString.getType() === body.getType()) {
        return new StringEntity(
            body.toString(),
            body.contentType.toString(),
            body.charset.toString()
        );
    }

    if (body.getType && EntityFile.getType() === body.getType()) {
        return new FileEntity(
            new java.io.File(body.toString()),
            body.contentType.toString()
        );
    }

    return null;
};

/**
 * Setup the body content entity on the request method.
 * @param {org.apache.http.client.methods.HttpUriRequest} method the apache http client method
 * @param {Http/Client/Params} params a Http Client Params object.
 */
Processor.process = function(method, params) {
    if (params.body === null || params.body === undefined) {
        return;
    }

    var entity = getEntity(params.body);
    if (entity !== null) {
        method.setEntity(entity);
        return;
    }

    method.setEntity(new StringEntity(
        params.body.toString(),
        params.encoding,
        'UTF-8'
    ));
};

module.exports = Processor;
