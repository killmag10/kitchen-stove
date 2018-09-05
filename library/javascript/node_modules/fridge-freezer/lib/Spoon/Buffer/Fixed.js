/**
 * Create a fixed buffer.
 * The buffer will only write out rows if it is full or close is called.
 *
 * @param   rowMeta     org.pentaho.di.core.row.RowMeta
 * @param   size        Number
 */
var Buffer = function(rowMeta, size) {
    global.trans_Status = SKIP_TRANSFORMATION;

    if (size < 0) {
        throw RangeError('Buffer size must be as minimum 0.');
    }

    var buffer = [];
    var step = _step_;
    var isValidation = (step.getStepname() === null);

    this.push = function(row) {
        buffer.push(row);

        if (buffer.length > size) {
            step.putRow(rowMeta, buffer.shift());
        }
    };

    this.close = function() {
        while (buffer.length > 0) {
            step.putRow(rowMeta, buffer.shift());
        }
    };
};

module.exports = Buffer;
