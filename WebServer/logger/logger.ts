import logger = require("debug");

// wrap debug.formatArgs() implementation
const origFormatArgs = logger.formatArgs;
logger.formatArgs = function (args) { // requires access to "this"
    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    const timezoneDate = new Date(Date.now() - timezoneOffset);
    const datetimeFormat = timezoneDate.toISOString()
        // .slice(0, 19)
        // .replace(/-/g, "/")
        .replace("T", " ")
        .replace("Z", "")
    
    // prepend datetime to arguments[0]
    args[0] = `${ '[' + datetimeFormat + ']' } ${ args[0] }`;
    
    // call original implementation
    origFormatArgs.call(this, args);
};

export = logger;