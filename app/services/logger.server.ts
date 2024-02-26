const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;


export const logger = createLogger({
    format: format.combine(
        format.timestamp(),
        format.prettyPrint(),
        format.colorize()
    ),

    transports: [
        new transports.File({
            filename: './app/logs/error.log',
            maxsize: 3000,
            level: 'error'
        }),
        new transports.File({
            filename: './app/logs/warning.log',
            maxsize: 3000,
            level: 'warn'
        }),
    ],
    exceptionHandlers: [
        new transports.File({
            filename: './app/logs/exceptions.log',
            maxsize: 3000,
        })
    ]
});