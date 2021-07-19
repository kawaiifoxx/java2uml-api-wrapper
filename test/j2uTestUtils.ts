import {Java2UMLImpl} from "../src/controllers/Java2UMLImpl";
import {createReadStream} from "fs";
import {jestLogger} from "../src/config/loggerConfig/loggerConfig";
import {Java2UMLConfig} from "../src/controllers/Java2UMLConfig";

/**
 * Contains utility methods for helping with unit tests.
 *
 * @author kawaiifoxx
 */
export namespace j2uTestUtils {
    export const TEST_FILE = "test/testSources/java2uml-api-no-dep.zip";
    export const J2U_CONFIG = {
        baseURL: "http://localhost:8090/api",
        timeout: 1000 * 60,
        headers: null,
        waitTime: 1000
    } as Java2UMLConfig

    /**
     * Returns id from given link, if id is not present then throws Error.
     * @param link
     * @private
     */
    export function extractIdFrom(link: String): number {
        const id = parseInt(link.split('/').pop()!!)
        if (isNaN(id)) throw Error('Id is not present.')

        return id
    }

    /**
     * Performs set up
     * @param j2u used to send http requests to Java2UML server.
     */
    export function setUp(j2u: Java2UMLImpl) {
        const response = j2u.upload((createReadStream(TEST_FILE)))
        response.catch(() => {
            jestLogger.error(`Unable To upload files, please check if Java2UML server is running  at ${J2U_CONFIG.baseURL}`)
            expect(false).toBeTruthy()
        })

        return response
    }
}