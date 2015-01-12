var EntityString = function(content, contentType, charset, transferEncoding)
{
    this.content = content;
    this.contentType = contentType;
    this.charset = charset;
    this.transferEncoding = transferEncoding;
}

EntityString.prototype.toString = function()
{
    return this.content.toString();
}

EntityString.prototype.valueOf = function()
{
    return this.toString();
}

EntityString.prototype.getType = function()
{
    return 'string';
}
EntityString.getType = EntityString.prototype.getType;

module.exports = EntityString;

