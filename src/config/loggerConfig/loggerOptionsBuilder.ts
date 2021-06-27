import {LoggerOptions} from "winston";
import TransportStream from "winston-transport"
import {Format} from "logform"

/**
 * A Builder class which helps in customizing {@link LoggerOptions}
 *
 * @author kawaiifoxx
 */
export class LoggerOptionsBuilder {
    private readonly options: LoggerOptions

    constructor() {
        this.options = {}
    }

    withLevel(level: string) {
        this.options.level = level
        return this
    }

    withTransports(...transports: TransportStream[]) {
        this.options.transports = transports
        return this
    }

    withFormat(format: Format) {
        this.options.format = format
        return this
    }

    build() {
        return this.options
    }

}