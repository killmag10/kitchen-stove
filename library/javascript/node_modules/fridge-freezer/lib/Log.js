var logMessage = function(type, messages)
{
    messages = Array.slice(messages);

    writeToLog(type, messages.join("\n"));
};

Log = {};

Log.log = function()
{
    logMessage('d', arguments);
};

Log.info = function()
{
    logMessage('l', arguments);
};

Log.warn = function()
{
    logMessage('m', arguments);
};

Log.error = function()
{
    logMessage('e', arguments);
};

module.exports = Log;
