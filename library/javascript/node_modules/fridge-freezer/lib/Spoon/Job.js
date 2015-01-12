if (global.Alert === undefined) {
    global.Alert = function Alert(obj)
    {
        var spoon = org.pentaho.di.core.gui.SpoonFactory.getInstance();
        if (null !== spoon)
        {
            var result = spoon.messageBox(
                obj,
                "Alert",
                true,
                org.pentaho.di.core.Const.INFO
            );

            if (!result) {
                throw new Error("Alert dialog cancelled by user.");
            }
        }
    }
}

if (global.writeToLog === undefined) {
    global.writeToLog = function writeToLog()
    {
        if (arguments.length > 2) {
            throw new SyntaxError(
                "The function call writeToLog requires 1 or 2 arguments."
            );
        }

        if (arguments.length==2){
            var type = arguments[0];
            var message = arguments[1];
        }else{
            var type = 'd';
            var message = arguments[0];
        }

        var log = new org.pentaho.di.core.logging.LogChannel(
            parent_job,
            parent_job
        );

        switch(type){
            case 'b':
                log.logBasic(message);
                break;
            case 'd':
                log.logDebug(message);
                break;
            case 'l':
                log.logDetailed(message);
                break;
            case 'e':
                log.logError(message);
                break;
            case 'm':
                log.logMinimal(message);
                break;
            case 'r':
                log.logRowlevel(message);
                break;
        }
    }
}
