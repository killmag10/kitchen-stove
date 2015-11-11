var Params = require('./../Params.js');
var EntityString = require('./../Entity/String.js');
var EntityMultipart = require('./../Entity/Multipart.js');
var EntityFile = require('./../Entity/File.js');

var ApacheMultipartStringPart =
    org.apache.commons.httpclient.methods.multipart.StringPart;
var ApacheMultipartFilePart =
    org.apache.commons.httpclient.methods.multipart.FilePart;
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

var getMultipartPart = function(body, name)
{
    if (body.getType && EntityString.getType() === body.getType())
    {
        var entity = new ApacheMultipartStringPart(
            name,
            body.toString(),
            body.charset.toString()
        );

        entity.setContentType(body.contentType.toString());
        entity.setTransferEncoding(body.transferEncoding.toString());
        return entity;
    }

    if (body.getType && EntityFile.getType() === body.getType())
    {
        var entity = new ApacheMultipartFilePart(
            name,
            new JavaFile(body.toString()),
            body.contentType.toString(),
            body.charset.toString()
        );
        entity.setTransferEncoding(body.transferEncoding.toString());
        return entity;
    }

    return null;
};

var getEntity = function(body)
{
    if (body.getType && EntityMultipart.getType() === body.getType())
    {
        var methodParams = new ApacheMethodParams();
        for (var key in body.params) {
            if (body.params[key] !== null) {
                methodParams.setParameter(key, body.params[key]);
            }
        }

        var multiParts = [];
        for (var key in body.parts) {
            if (body.parts[key] !== null) {
                multiParts.push(
                    getMultipartPart(
                        body.parts[key],
                        key
                    )
                );
            }
        }

        return new ApacheMultipartRequestEntity(
            multiParts,
            methodParams
        );
    }

    if (body.getType && EntityString.getType() === body.getType())
    {
        return new ApacheStringRequestEntity(
            body.toString(),
            body.contentType.toString(),
            body.charset.toString()
        );
    }

    if (body.getType && EntityFile.getType() === body.getType())
    {
        return new ApacheFileRequestEntity(
            new java.io.File(body.toString()),
            body.contentType.toString()
        );
    }

    return null;
};

Processor.process = function(method, params)
{
    if (params.body === null || params.body === undefined) return;

    var entity = getEntity(params.body);
    if (entity !== null) {
        var ByteArray = new JavaByteArrayOutputStream();
        entity.writeRequest(ByteArray);

        method.setRequestEntity(
            entity
        );

        return;
    }

    method.setRequestBody(
        params.body.valueOf()
    );

    return;
};

module.exports = Processor;
