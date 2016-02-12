"use strict";

var Types = require('./Types');

/**
 * Description object for the row fields.
 *
 * @class
 * @param  {Object} fields
 */
var OptionsFieldDescription = function(fields){
    this.fields = fields;
};

/**
 * Field definition.
 * @type {Object}
 */
OptionsFieldDescription.prototype.fields = null;

/**
 * Get fields of the given type.
 *
 * @param  {Types} type     A field type.
 * @return {Object}         Returns the fields with this type.
 */
OptionsFieldDescription.prototype.getFieldsByType = function(type)
{
    var self = this;

    return Object.keys(this.fields).filter(function(key) {
        return self.fields[key].toString() === type;
    });
};

/**
 * Convert row meta to field definition.
 * @param  {org.pentaho.di.core.row.RowMeta} rowMeta    Spoon row meta.
 * @param  {OptionsFieldDescription.type} defaultType         Default type for fields.
 * @return {Obect}      Field definition
 */
OptionsFieldDescription.convertRowMeta = function(rowMeta, defaultType)
{
    var result = {};
    for(var key = 0; key < rowMeta.size(); key++){
        var valueMeta = rowMeta.getValueMeta(key);
        result[valueMeta.getName()] = defaultType;
    }

    return result;
};

module.exports = OptionsFieldDescription;
