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

    beforeEach(done => setUp(j2u, done))

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


function setUp(j2u: Java2UMLImpl, done: jest.DoneCallback) {
    j2u.upload((createReadStream(TEST_FILE))).then(() => done()).catch(() => {
        jestLogger.error(`Unable To upload files, please check if Java2UML server is running  at ${J2U_CONFIG.baseURL}`)
        expect(false).toBeTruthy()
        done()
    })
}

describe('When using J2U.getSource(),', () => {
    const j2u = new Java2UMLImpl(J2U_CONFIG)
    beforeEach(done => setUp(j2u, done))
    jest.setTimeout(1000 * 20)

    test('should get valid source, when uploading valid java source code.', async () => {
        const source = await j2u.getSource()
        expect(source).toBeDefined()
        expect(source).toHaveProperty("content")
        expect(source).toHaveProperty("_links")
        expect(source.content).toHaveProperty("id")
        jestLogger.info(source)
    })

})


describe('All Get requests.', () => {
    const j2u = new Java2UMLImpl(J2U_CONFIG)
    beforeAll(done => {
        setUp(j2u, done)
        j2u.getSource(100).then(done)
    })

    jest.setTimeout(1000 * 60)

    describe('When using J2U.getPUMLCode()', () => {
        test('should get valid puml code, when project info has been setup', async () => {
            const pumlCode = await j2u.getPlantUMLCode()

            expect(pumlCode).toBeDefined()
            expect(pumlCode.content).toHaveProperty("content")
        })
    })

    describe('When using J2U.getSvg()', () => {
        test('should get valid svg, when project info has been setup', async () => {
            const svg = await j2u.getUMLSvg(20)
            expect(svg).toBeDefined()
        })
    })

    describe('When using J2U.getClassOrInterface()', () => {
        test('should get valid list, when source has been setup', async () => {
            const classOrInterfaceList = await j2u.getClassOrInterfaces()

            expect(classOrInterfaceList).toBeDefined()
            expect(classOrInterfaceList.content).toBeInstanceOf(Array)
            expect(classOrInterfaceList.content[0].content).toHaveProperty("id")
            expect(classOrInterfaceList.content[0].content).toHaveProperty("name")
            expect(classOrInterfaceList.content[0].content).toHaveProperty("packageName")
            expect(classOrInterfaceList.content[0].content).toHaveProperty("isGeneric")
            expect(classOrInterfaceList.content[0].content).toHaveProperty("isClass")
            expect(classOrInterfaceList.content[0].content).toHaveProperty("isExternal")
        })
    })
})