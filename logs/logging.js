const SimpleNodeLogger = require('simple-node-logger');

const consoleLogger = SimpleNodeLogger.createSimpleLogger({
    timestampFormat: 'YYYY-MM-DD HH:mm:ss',
});

const fileLogger = SimpleNodeLogger.createSimpleLogger({
    logFilePath: 'logs/error.log',
    dfltLevel: 'error',
    timestampFormat: 'YYYY-MM-DD HH:mm:ss',
});

exports.log = {
    console: consoleLogger,
    file: fileLogger,
};
