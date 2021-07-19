// noinspection DuplicatedCode

import {createReadStream} from "fs";
import {Java2UMLImpl} from "../src/controllers/Java2UMLImpl";
import {jestLogger} from "../src/config/loggerConfig/loggerConfig";
import {ErrorResponse} from "../src/interfaces/ErrorResponse";
import {j2uTestUtils} from "./j2uTestUtils";
import J2U_CONFIG = j2uTestUtils.J2U_CONFIG;
import TEST_FILE = j2uTestUtils.TEST_FILE;
import setUp = j2uTestUtils.setUp;
import extractIdFrom = j2uTestUtils.extractIdFrom;


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

    describe('When using J2U.getClassOrInterfaces()', () => {
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

    describe('When using J2U.getEnums()', () => {
        test('should get a valid list of enums, when source has been setup', async () => {
            const enumsList = await j2u.getEnums()

            expect(enumsList).toBeDefined()
            expect(enumsList.content).toBeInstanceOf(Array)
            expect(enumsList.content[0].content).toHaveProperty("id")
            expect(enumsList.content[0].content).toHaveProperty("name")
            expect(enumsList.content[0].content).toHaveProperty("packageName")
        })
    })

    describe('When using J2U.getClassRelations', () => {
        test('should get a valid list of classRelations, when source has been setup', async () => {
            const classRelationList = await j2u.getClassRelations()

            expect(classRelationList).toBeDefined()
            expect(classRelationList.content).toBeInstanceOf(Array)
            expect(classRelationList.content[0].content).toHaveProperty("id")
            expect(classRelationList.content[0].content).toHaveProperty("relation")
            expect(classRelationList.content[0].content).toHaveProperty("fromId")
            expect(classRelationList.content[0].content).toHaveProperty("toId")
        })
    })

    describe('When using J2U.getMethods()', () => {
        test('should get a valid list of methods, when source has been setup', async () => {
            const classOrInterfaces = await j2u.getClassOrInterfaces()
            const classOrInterface = classOrInterfaces.content[5]
            const methods = await j2u.getMethods(extractIdFrom(classOrInterface._links.get("methods")!!))

            expect(methods).toBeDefined()
            expect(methods.content).toBeInstanceOf(Array)
            expect(methods._links).toBeInstanceOf(Map)
            expect(methods.content[0].content).toHaveProperty("id")
            expect(methods.content[0].content).toHaveProperty("name")
            expect(methods.content[0].content).toHaveProperty("returnType")
            expect(methods.content[0].content).toHaveProperty("signature")
            expect(methods.content[0].content).toHaveProperty("visibility")
            expect(methods.content[0].content).toHaveProperty("isStatic")
            expect(methods.content[0].content).toHaveProperty("parameters")
            expect(methods.content[0].content).toHaveProperty("typeParameters")
            expect(methods.content[0].content).toHaveProperty("specifiedExceptions")
            expect(methods.content[0].content.specifiedExceptions).toBeInstanceOf(Array)
            expect(methods.content[0].content.parameters).toBeInstanceOf(Array)
            expect(methods.content[0].content.typeParameters).toBeInstanceOf(Array)
        })
    })

    describe('When using J2U.getConstructors()', () => {
        test('should get a valid list of constructors, when source has been setup', async () => {
            const classOrInterfaces = await j2u.getClassOrInterfaces()
            const classOrInterface = classOrInterfaces.content[5]
            const constructors = await j2u.getConstructors(extractIdFrom(classOrInterface._links.get("constructors")!!))

            expect(constructors).toBeDefined()
            expect(constructors.content).toBeInstanceOf(Array)
            expect(constructors._links).toBeInstanceOf(Map)
            expect(constructors.content[0].content).toHaveProperty("id")
            expect(constructors.content[0].content).toHaveProperty("name")
            expect(constructors.content[0].content).toHaveProperty("signature")
            expect(constructors.content[0].content).toHaveProperty("visibility")
            expect(constructors.content[0].content).toHaveProperty("compilerGenerated")
            expect(constructors.content[0].content).toHaveProperty("parameters")
            expect(constructors.content[0].content).toHaveProperty("typeParameters")
            expect(constructors.content[0].content).toHaveProperty("specifiedExceptions")
            expect(constructors.content[0].content.specifiedExceptions).toBeDefined()
            expect(constructors.content[0].content.specifiedExceptions).toBeInstanceOf(Array)
            expect(constructors.content[0].content.parameters).toBeInstanceOf(Array)
        })
    })

    describe('When using J2U.getFields()', () => {
        test('should get a valid list of fields, when source has been setup', async () => {
            const classOrInterfaces = await j2u.getClassOrInterfaces()
            const classOrInterface = classOrInterfaces.content[5]
            const fields = await j2u.getFields(extractIdFrom(classOrInterface._links.get("fields")!!))

            expect(fields).toBeDefined()
            expect(fields.content).toBeInstanceOf(Array)
            expect(fields._links).toBeInstanceOf(Map)
            expect(fields.content[0].content).toHaveProperty("id")
            expect(fields.content[0].content).toHaveProperty("typeName")
            expect(fields.content[0].content).toHaveProperty("name")
            expect(fields.content[0].content).toHaveProperty("visibility")
            expect(fields.content[0].content).toHaveProperty("isStatic")
        })
    })
})