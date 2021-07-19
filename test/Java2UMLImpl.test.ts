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
import {ClassOrInterface} from "../src/interfaces/ClassOrInterface";
import {EntityModel} from "../src/interfaces/EntityModel";
import {Method} from "../src/interfaces/Method";
import {ClassRelation} from "../src/interfaces/ClassRelation";
import {Enum} from "../src/interfaces/Enum";
import {Constructor} from "../src/interfaces/Constructor";
import {Field} from "../src/interfaces/Field";
import {EnumConstant} from "../src/interfaces/EnumConstant";


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

    beforeEach(() => setUp(j2u))

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
    beforeEach(() => setUp(j2u))
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
    beforeAll(() => setUp(j2u).then(() => j2u.getSource(100)))

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
            expectToBeClassOrInterface(classOrInterfaceList.content[0])
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

    describe('When using J2U.getClassRelations()', () => {
        test('should get a valid list of classRelations, when source has been setup', async () => {
            const classRelationList = await j2u.getClassRelations()

            expect(classRelationList).toBeDefined()
            expect(classRelationList.content).toBeInstanceOf(Array)
            expectToBeClassRelation(classRelationList.content[0])
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
            expectToBeMethod(methods.content[0])
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

            expectToBeConstructor(constructors.content[0])
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

            expectToBeField(fields.content[0])
        })
    })

    describe('When using J2U.getEnumConstants()', () => {
        test('should get a valid list of enum constants, when source has been setup', async () => {
            const enums = await j2u.getEnums()
            const enumEntityModel = enums.content[0]
            const enumConstants = await j2u.getEnumConstants(extractIdFrom(enumEntityModel._links.get("enumConstants")!!))

            expect(enumConstants).toBeDefined()
            expect(enumConstants.content).toBeInstanceOf(Array)
            expect(enumConstants._links).toBeInstanceOf(Map)
            expect(enumConstants.content[0].content).toHaveProperty("id")
            expect(enumConstants.content[0].content).toHaveProperty("name")
        })
    })

    describe('When using J2U.getBody*()', () => {
        test('should get a valid body, when source has been setup', async () => {
            const classOrInterfaces = await j2u.getClassOrInterfaces()
            const classOrInterface = classOrInterfaces.content[5]
            const body = await j2u.getBodyByParentId(extractIdFrom(classOrInterface._links.get("body")!!))
            const bodyByOwnId = await j2u.getBody(body.content.id)

            expect(body).toBeDefined()
            expect(body.content).toHaveProperty("id")
            expect(body.content).toHaveProperty("content")
            expect(body._links).toBeInstanceOf(Map)

            expect(bodyByOwnId).toBeDefined()
            expect(bodyByOwnId.content).toHaveProperty("id")
            expect(bodyByOwnId.content).toHaveProperty("content")
            expect(bodyByOwnId._links).toBeInstanceOf(Map)
        })
    })

    describe('When using J2U.getCallGraph()', () => {
        test('should get a valid list of CallGraphRelation, when source has been setup', async () => {
            const classOrInterfaces = await j2u.getClassOrInterfaces()
            const classOrInterface = classOrInterfaces.content[5]
            const methods = await j2u.getMethods(extractIdFrom(classOrInterface._links.get("methods")!!))
            const method = methods.content[0]
            const callGraphRelationList = await j2u.getCallGraph(extractIdFrom(method._links.get("callGraph")!!))

            expect(callGraphRelationList).toBeDefined()
            expect(callGraphRelationList.content).toBeInstanceOf(Array)
            expect(callGraphRelationList._links).toBeInstanceOf(Map)

            expect(callGraphRelationList.content[0].content).toHaveProperty("from")
            expect(callGraphRelationList.content[0].content).toHaveProperty("to")
        })
    })

    describe('When using J2U.getClassOrInterface()', () => {
        test('should get valid classOrInterface, when source has been setup', async () => {
            const classOrInterfaceList = await j2u.getClassOrInterfaces()
            const classOrInterface = await j2u.getClassOrInterface(classOrInterfaceList.content[0].content.id)

            expectToBeClassOrInterface(classOrInterface);
        })
    })

    describe('When using J2U.getEnum()', () => {
        test('should get a valid enum, when source has been setup', async () => {
            const enumsList = await j2u.getEnums()
            const enumModel = await j2u.getEnum(enumsList.content[0].content.id)

            expectToBeEnum(enumModel);
        })
    })

    describe('When using J2U.getClassRelation()', () => {
        test('should get a valid classRelation, when source has been setup', async () => {
            const classRelationList = await j2u.getClassRelations()
            const classRelation = await j2u.getClassRelation(classRelationList.content[0].content.id)

            expectToBeClassRelation(classRelation);
        })
    })

    describe('When using J2U.getMethod()', () => {
        test('should get a valid method, when source has been setup', async () => {
            const classOrInterfaces = await j2u.getClassOrInterfaces()
            const classOrInterface = classOrInterfaces.content[5]
            const methods = await j2u.getMethods(extractIdFrom(classOrInterface._links.get("methods")!!))
            const method = await j2u.getMethod(methods.content[0].content.id)

            expectToBeMethod(method);
        })
    })

    describe('When using J2U.getConstructor()', () => {
        test('should get a valid constructor, when source has been setup', async () => {
            const classOrInterfaces = await j2u.getClassOrInterfaces()
            const classOrInterface = classOrInterfaces.content[5]
            const constructors = await j2u.getConstructors(extractIdFrom(classOrInterface._links.get("constructors")!!))
            const constructor = await j2u.getConstructor(constructors.content[0].content.id)

            expectToBeConstructor(constructor);
        })
    })

    describe('When using J2U.getField()', () => {
        test('should get a valid field, when source has been setup', async () => {
            const classOrInterfaces = await j2u.getClassOrInterfaces()
            const classOrInterface = classOrInterfaces.content[5]
            const fields = await j2u.getFields(extractIdFrom(classOrInterface._links.get("fields")!!))
            const field = await j2u.getField(fields.content[0].content.id)


            expectToBeField(field);
        })
    })

    describe('When using J2U.getEnumConstant()', () => {
        test('should get a valid enum constant, when source has been setup', async () => {
            const enums = await j2u.getEnums()
            const enumEntityModel = enums.content[0]
            const enumConstants = await j2u.getEnumConstants(extractIdFrom(enumEntityModel._links.get("enumConstants")!!))
            const enumConstant = await j2u.getEnumConstant(enumConstants.content[0].content.id)

            expectToBeEnumConstant(enumConstant);
        })
    })


    /*========================================================================*
     *                        ADDITIONAL TEST HELPERS                         *
     *========================================================================*/

    /**
     * Tests for properties of {@link EnumConstant}
     * @param enumConstant to be tested.
     */
    function expectToBeEnumConstant(enumConstant: EntityModel<EnumConstant>) {
        expect(enumConstant.content).toHaveProperty("id")
        expect(enumConstant.content).toHaveProperty("name")
    }

    /**
     * Tests for properties of {@link Field}
     * @param field to be tested.
     */
    function expectToBeField(field: EntityModel<Field>) {
        expect(field.content).toHaveProperty("id")
        expect(field.content).toHaveProperty("typeName")
        expect(field.content).toHaveProperty("name")
        expect(field.content).toHaveProperty("visibility")
        expect(field.content).toHaveProperty("isStatic")
    }

    /**
     * Tests for properties of {@link Constructor}
     * @param constructor to be tested.
     */
    function expectToBeConstructor(constructor: EntityModel<Constructor>) {
        expect(constructor.content).toHaveProperty("id")
        expect(constructor.content).toHaveProperty("name")
        expect(constructor.content).toHaveProperty("signature")
        expect(constructor.content).toHaveProperty("visibility")
        expect(constructor.content).toHaveProperty("compilerGenerated")
        expect(constructor.content).toHaveProperty("parameters")
        expect(constructor.content).toHaveProperty("typeParameters")
        expect(constructor.content).toHaveProperty("specifiedExceptions")
        expect(constructor.content.specifiedExceptions).toBeDefined()
        expect(constructor.content.specifiedExceptions).toBeInstanceOf(Array)
        expect(constructor.content.parameters).toBeInstanceOf(Array)
    }

    /**
     * Tests for properties of {@link Enum}
     * @param enumModel to be tested.
     */
    function expectToBeEnum(enumModel: EntityModel<Enum>) {
        expect(enumModel._links).toBeInstanceOf(Map)
        expect(enumModel.content).toHaveProperty("id")
        expect(enumModel.content).toHaveProperty("name")
        expect(enumModel.content).toHaveProperty("packageName")
    }

    /**
     * Tests for properties of {@link ClassRelation}
     * @param classRelation to be tested.
     */
    function expectToBeClassRelation(classRelation: EntityModel<ClassRelation>) {
        expect(classRelation._links).toBeInstanceOf(Map)
        expect(classRelation.content).toHaveProperty("id")
        expect(classRelation.content).toHaveProperty("relation")
        expect(classRelation.content).toHaveProperty("fromId")
        expect(classRelation.content).toHaveProperty("toId")
    }

    /**
     * Tests for properties of {@link Method}
     * @param method to be tested.
     */
    function expectToBeMethod(method: EntityModel<Method>) {
        expect(method.content).toHaveProperty("id")
        expect(method.content).toHaveProperty("name")
        expect(method.content).toHaveProperty("returnType")
        expect(method.content).toHaveProperty("signature")
        expect(method.content).toHaveProperty("visibility")
        expect(method.content).toHaveProperty("isStatic")
        expect(method.content).toHaveProperty("parameters")
        expect(method.content).toHaveProperty("typeParameters")
        expect(method.content).toHaveProperty("specifiedExceptions")
        expect(method.content.specifiedExceptions).toBeInstanceOf(Array)
        expect(method.content.parameters).toBeInstanceOf(Array)
        expect(method.content.typeParameters).toBeInstanceOf(Array)
    }

    /**
     * Tests for properties of {@link ClassOrInterface}
     * @param classOrInterface to be tested.
     */
    function expectToBeClassOrInterface(classOrInterface: EntityModel<ClassOrInterface>) {
        expect(classOrInterface._links).toBeInstanceOf(Map)
        expect(classOrInterface.content).toHaveProperty("id")
        expect(classOrInterface.content).toHaveProperty("name")
        expect(classOrInterface.content).toHaveProperty("packageName")
        expect(classOrInterface.content).toHaveProperty("isGeneric")
        expect(classOrInterface.content).toHaveProperty("isClass")
        expect(classOrInterface.content).toHaveProperty("isExternal")
    }
})