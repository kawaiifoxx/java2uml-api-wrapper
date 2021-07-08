import winston, {Logger} from "winston";
import {transports} from "./transportConfig";
import loggerFormatConfigurer, {consolePrintingFormat} from "./formatConfig";
import {LoggerOptionsBuilder} from "./loggerOptionsBuilder";

const optionsBuilder = new LoggerOptionsBuilder()

/**
 * Create logger with provided config.
 * @param id id of logger
 * @param label label of logger.
 * @param level Set Logging level.
 */
function createLogger(id: string, label: string = id, level: "info" | "warn" | "error" | "debug" = "info"): Logger {
    return winston.loggers.add(
        id,
        optionsBuilder
            .withFormat(loggerFormatConfigurer(label, consolePrintingFormat))
            .withLevel(level)
            .withTransports(...transports)
            .build()
    );
}

/**
 * This is default logger.
 */
export const logger = createLogger("default", "J2U WRAPPER");