// Do not exit on error.
process.removeAllListeners('uncaughtException');
// Throw the exception for java above.
process.on('uncaughtException', function(err) {
    throw err;
});
