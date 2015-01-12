var EntityMultipart = function(parts, params)
{
    if (!parts instanceof Array) {
        throw new TypeError('parts must be an array');
    }

    this.parts = parts;
    this.params = params;
}

EntityMultipart.prototype.getType = function()
{
    return 'multipart';
}
EntityMultipart.getType = EntityMultipart.prototype.getType;

module.exports = EntityMultipart;
