var Properties = require('../Java/System/Properties');

var Distribute = function(rowMeta)
{
    trans_Status = SKIP_TRANSFORMATION;

    var step = _step_;
    var isValidation = (step.getStepname() === null);

    if (!isValidation && step.isDistributed() !== true) {
        throw new Error("Only for distributing!");
    }

    var getOutputRowSets = function()
    {
        if (isValidation) {
            var dummyRowSets = new java.util.ArrayList();
            dummyRowSets.add(
                new org.pentaho.di.core.SingleRowRowSet()
            );
            return dummyRowSets;
        }

        return step.getOutputRowSets();
    };

    var rowSetCount = getOutputRowSets().size();
    var rowSetFullCount = 0;
    var rowSetPosition = 0;
    var putTimeout = Properties.get('KETTLE_ROWSET_PUT_TIMEOUT');

    var getOutputSingleRowSetsSizeMax = function()
    {
        if (isValidation) return 1;

        return step.getTrans().getTransMeta().getSizeRowset();
    };

    var resetRowSetFullCount = function()
    {
        rowSetFullCount = 0;
    };

    var nextRowSet = function()
    {
        if(rowSetFullCount >= rowSetCount) {
            resetRowSetFullCount();
            java.lang.Thread.sleep(putTimeout);
        }

        rowSetPosition++;
        if (rowSetPosition >= rowSetCount) {
            rowSetPosition = 0;
        }
        rowSetFullCount++;

        return true;
    };

    this.push = function(row)
    {
        var rowSets = getOutputRowSets().toArray();

        nextRowSet();
        while (
            rowSets[rowSetPosition].size() >= getOutputSingleRowSetsSizeMax()
        ){
            if (step.isStopped()) return;
            nextRowSet();
        }

        result = rowSets[rowSetPosition].putRow(rowMeta, row);
        if (result && !isValidation) {
            step.incrementLinesWritten();
        }
        resetRowSetFullCount();

        return result;
    };
};

module.exports = Distribute;
