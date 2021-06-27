import winston, {format} from "winston";


/**
 * If info.ignore is set to true then do not log corresponding info.
 */
const ignoreFormat = format((info) => {
    if (info.ignore) {
        return false;
    }
    return info;
})();

/**
 * A simple format for logging in console or files.
 */
export const consolePrintingFormat = format.printf(info => `${info.timestamp} ${info.level}: ${info.label}: ${info.message}`)

/**
 * Creates a Format using {@link format.combine()}, this format can be customized
 * by passing a label param and additionalFormat
 *
 * @param label Label to be printed when using this format.
 * @param additionalFormats Extra formats if any.
 */
export default function loggerFormatConfigurer(label: string, ...additionalFormats: winston.Logform.Format[]) {
    return format.combine(
        format.colorize({all: true, colors: {'info': 'green', 'warn': 'yellow', 'error': 'red', 'debug': 'blue'}}),
        format.timestamp(),
        format.label({label: label}),
        format.errors({stack: true}),
        ignoreFormat,
        ...additionalFormats
    )
}