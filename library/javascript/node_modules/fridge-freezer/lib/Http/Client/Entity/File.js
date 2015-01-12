var EntityFile = function(file, contentType, charset, transferEncoding)
{
    this.file = file;
    this.contentType = contentType;
    this.charset = charset;
    this.transferEncoding = transferEncoding;
}

EntityFile.prototype.toString = function()
{
    return this.file.toString();
}

EntityFile.prototype.valueOf = function()
{
    return this.toString();
}

EntityFile.prototype.getType = function()
{
    return 'file';
}
EntityFile.getType = EntityFile.prototype.getType;

module.exports = EntityFile;

