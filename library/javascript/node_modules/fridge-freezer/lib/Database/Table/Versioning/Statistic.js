'use strict';

var RowStatus = require('./Row/Status');

var Statistic = function()
{
    /**
     * org.pentaho.di.trans.step.BaseStep}
     * @param  {java:org.pentaho.di.trans.step.BaseStep} step
     */
    this.setStep = function(step) {
        this.step = step;
    };

    this.incrementStatus = function(status, value){
        if(this.step){
            switch(status) {
                case RowStatus.new:
                case RowStatus.outdated:
                    this.step.incrementLinesOutput();
                    this.step.incrementLinesInput();
                    break;
                case RowStatus.changed:
                    this.step.incrementLinesUpdated();
                    this.step.incrementLinesOutput();
                    this.step.incrementLinesInput();
                    break;
                case RowStatus.update:
                    this.step.incrementLinesUpdated();
                    this.step.incrementLinesInput();
                    break;
                case RowStatus.identical:
                    this.step.incrementLinesInput();
                    break;
                case RowStatus.purged:
                    this.step.incrementLinesRejected();
                    break;
                case RowStatus.skiped:
                    this.step.incrementLinesInput();
                    break;
            }
        }
    };

    this.addUpdated = function(count) {
        if (this.step) {
            this.step.setLinesRejected(this.step.getLinesRejected() + count);
        }
    };
};

/**
 * A spoon BaseStep.
 * @type {org.pentaho.di.trans.step.BaseStep}
 */
Statistic.prototype.step = null;

module.exports = Statistic;
