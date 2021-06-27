import winston from "winston";
import {transports} from "./transportConfig";
import loggerFormatConfigurer, {consolePrintingFormat} from "./formatConfig";
import {LoggerOptionsBuilder} from "./loggerOptionsBuilder";

const optionsBuilder = new LoggerOptionsBuilder()

export const logger = winston.createLogger(
    optionsBuilder
        .withFormat(loggerFormatConfigurer("MAIN", consolePrintingFormat))
        .withLevel("info")
        .withTransports(...transports)
        .build()
);



