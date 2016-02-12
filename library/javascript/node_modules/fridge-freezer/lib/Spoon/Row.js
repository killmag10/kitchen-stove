Row = {};

/**
 * Convert a spoon row object to a Javscript Object.
 *
 * @param   rowMeta     org.pentaho.di.core.row.RowMeta
 * @param   row         java.lang.Object[]
 * @param   convert     Boolean     Convert the Java objects to Javascript objects.
 */
Row.toJS = function(rowMeta, row, convert)
{
    if (convert === undefined) convert = true;

    var valueMetaList = rowMeta.getValuevalueMetaList().toArray();
    var result = {};

    valueMetaList.forEach(function(meta, index) {
        var value = row[index];

        if (convert && value !== null) {
            value = meta.convertToNormalStorageType(value);

            if (value !== null) {
                value = org.mozilla.javascript.Context.getCurrentContext()
                    .toObject(value, global);
            }
        }

        result[String(meta.getName())] = value;
    });

    return result;
};

module.exports = Row;
