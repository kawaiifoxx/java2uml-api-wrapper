import {createReadStream} from "fs";
import {Java2UMLImpl} from "../src/controllers/Java2UMLImpl";
import {jestLogger} from "../src/config/loggerConfig/loggerConfig";
import {ErrorResponse} from "../src/interfaces/ErrorResponse";
import {Java2UMLConfig} from "../src/controllers/Java2UMLConfig";


const TEST_FILE = "test/testSources/java2uml-api-no-dep.zip";
const J2U_CONFIG = {baseURL: "http://localhost:8090/api", timeout: 1000 * 60, headers: null} as Java2UMLConfig

describe(`When using J2U.upload(), `, () => {
    const j2u = new Java2UMLImpl(J2U_CONFIG)

    test("should upload files on the java2uml server successfully and receive valid projectInfo", done => {
        j2u.upload(createReadStream(TEST_FILE)).then(val => {
            try {
                expect(val.content.projectName).toBe('java2uml-api-no-dep.zip')
                expect(val.content.fileType).toBe('application/zip')
                expect(val.content.id).not.toBeNull()

                jestLogger.info(val)
                done()
            } catch (e) {
                done(e)
            }
        }).catch(_ => {
            // fail() does not work for some reason.
            expect(false).toBeTruthy()
            done()
        })
    })

    test("should get 415 when uploading unsupported file type", done => {
        j2u.upload(createReadStream("test/testSources/Test.txt")).then(_ => {
            expect(false).toBeTruthy()
            done()
        }).catch(e => {
            jestLogger.info(e)
            const errorResponse = e.response.data as ErrorResponse
            expect(errorResponse).toHaveProperty("timestamp")
            expect(errorResponse).toHaveProperty("httpStatus")
            expect(errorResponse).toHaveProperty("errors")
            expect(errorResponse).toHaveProperty("reason")
            expect(errorResponse.httpStatus).toEqual("UNSUPPORTED_MEDIA_TYPE")
            done()
            return e
        })
    })

})


describe('When using J2U.getProjectInfo(),', () => {
    const j2u = new Java2UMLImpl(J2U_CONFIG)

    beforeEach(done => {
        j2u.upload((createReadStream(TEST_FILE))).then(() => done()).catch(() => {
            jestLogger.error(`Unable To upload files, please check if Java2UML server is running  at ${J2U_CONFIG.baseURL}`)
            expect(false).toBeTruthy()
            done()
        })
    })

    test('should get project info if file has been uploaded.', async () => {
        try {
            const projectInfo = await j2u.getProjectInfo()
            expect(projectInfo).toHaveProperty("content")
            expect(projectInfo.content).toHaveProperty("projectName")
            expect(projectInfo._links).toBeDefined()
            expect(projectInfo.content.id).toBeDefined()
            jestLogger.info(projectInfo)
        } catch (e) {
            jestLogger.error('Unable to fetch project info.', e)
            expect(false).toBeTruthy()
        }
    })

    test('should throw error if project id is null in j2u.', async () => {
        const myJ2U = new Java2UMLImpl(J2U_CONFIG)

        try {
            await myJ2U.getProjectInfo()
        } catch (e) {
            jestLogger.info(e)
            expect(e).toBeInstanceOf(Error)
        }
    })
})