
/*
 * Spacial actions for a spoon transformation step.
 */
var Step = {}

var executionPathCache = null;

/*
 * Get the step names from bottom to the root as array.
 *
 * @return Array - Step name list.
 */
Step.getExecutionPath = function()
{
    var currentStep = _step_;

    var executionPath = [];
    executionPath.push(currentStep.getObjectName());
    while (currentStep = currentStep.getParent()) {
        executionPath.push(
            currentStep.getObjectName()
        );
    }

    executionPathCache = executionPath.reverse();

    return executionPathCache;
}

module.exports = Step;
