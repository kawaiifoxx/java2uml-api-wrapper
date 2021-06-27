import winston from "winston";
import {transports} from "./transportConfig";
import loggerFormatConfigurer, {consolePrintingFormat} from "./formatConfig";
import {LoggerOptionsBuilder} from "./loggerOptionsBuilder";

const optionsBuilder = new LoggerOptionsBuilder()

/**
 * This is default logger.
 */
export const logger = winston.loggers.add(
    "default",
    optionsBuilder
        .withFormat(loggerFormatConfigurer("J2U WRAPPER", consolePrintingFormat))
        .withLevel("info")
        .withTransports(...transports)
        .build()
);



