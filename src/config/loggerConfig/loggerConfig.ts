import winston, {Logger} from "winston";
import {transports} from "./transportConfig";
import loggerFormatConfigurer, {consolePrintingFormat} from "./formatConfig";
import {LoggerOptionsBuilder} from "./loggerOptionsBuilder";

const optionsBuilder = new LoggerOptionsBuilder()

/**
 * Create logger with provided config.
 * @param id id of logger
 * @param label label of logger.
 * @param level ["info" | "warn" | "error" | "debug"] Set Logging level. (default - "info")
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



/*================================================================================*
 *                           LOGGER DECLARATIONS                                  *
 *================================================================================*/

/**
 * This is default logger.
 */
export const defaultLogger = createLogger("default", "J2U WRAPPER");

/**
 * Java2UML Logger
 */
export const j2ULogger = createLogger("j2u", "Java2UMLImpl")

/**
 * Unit Tests logger
 */
export const jestLogger = createLogger("JEST", "Unit Test")