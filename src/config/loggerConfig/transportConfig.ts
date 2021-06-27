/**
 * Define transport array (i.e places where logged output will be sent.)
 */
import winston from "winston";
import TransportStream from "winston-transport";

export const transports: TransportStream[] = [
    new winston.transports.Console({
        level: 'info',
        stderrLevels: ['error'],
        consoleWarnLevels: ['warn']
    }),
    new winston.transports.File({
        level: 'info',
        filename: 'logs/app_info.log',
        maxsize: 1000_0000,
        maxFiles: 10,
        tailable: true,
        zippedArchive: true
    }),
    new winston.transports.File({
        level: 'error',
        filename: 'logs/apps_error.log',
        maxsize: 1000_0000,
        maxFiles: 10,
        tailable: true,
        zippedArchive: true
    })
];