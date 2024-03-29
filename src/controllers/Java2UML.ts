import {ProjectInfo} from "../interfaces/ProjectInfo";
import {Source} from "../interfaces/Source";
import {UMLBody} from "../interfaces/UMLBody";
import {ClassOrInterface} from "../interfaces/ClassOrInterface";
import {EntityModel} from "../interfaces/EntityModel";
import {Enum} from "../interfaces/Enum";
import {ClassRelation} from "../interfaces/ClassRelation";
import {Method} from "../interfaces/Method";
import {Constructor} from "../interfaces/Constructor";
import {Field} from "../interfaces/Field";
import {Body} from "../interfaces/Body";
import {EnumConstant} from "../interfaces/EnumConstant";
import {CallGraphRelation} from "../interfaces/CallGraphRelation";
import {ReadStream} from "fs";

/**
 * A class for interacting with Java2UML API
 */
export interface Java2UML {
    /**
     * Upload java source code to Java2UMl API
     * @param file Zip file containing Java Code Base
     * @param onProgress  allows handling of progress events for uploads
     */
    upload(
        file: File | ReadStream,
        onProgress: (progressEvent: ProgressEvent) => void
    ): Promise<EntityModel<ProjectInfo>>

    /**
     * Get uploaded project information.
     */
    getProjectInfo(): Promise<EntityModel<ProjectInfo>>

    /**
     * Get source of project.
     * @param retryLimit No of times to retry before throwing exception for 202 HTTP.
     */
    getSource(retryLimit: number): Promise<EntityModel<Source>>

    /**
     * Get generated plant uml code.
     * @param retryLimit No of times to retry before throwing exception for 202 HTTP.
     */
    getPlantUMLCode(retryLimit: number): Promise<EntityModel<UMLBody>>

    /**
     * Get all the classes and interfaces present in parsed java code base.
     */
    getClassOrInterfaces(): Promise<EntityModel<EntityModel<ClassOrInterface>[]>>

    /**
     * Get all the {@link Enum}s present in parsed java code base.
     */
    getEnums(): Promise<EntityModel<EntityModel<Enum>[]>>

    /**
     * Get all the {@link ClassRelation}s present in parsed java code base.
     */
    getClassRelations(): Promise<EntityModel<EntityModel<ClassRelation>[]>>

    /**
     * Get all the {@link Method}s present in {@link ClassOrInterface} or {@link Enum}
     * @param id of {@link ClassOrInterface} or {@link Enum}
     */
    getMethods(id: number): Promise<EntityModel<EntityModel<Method>[]>>

    /**
     * Get all the {@link Constructor}s present in {@link ClassOrInterface} or {@link Enum}
     * @param id of {@link ClassOrInterface} or {@link Enum}
     */
    getConstructors(id: number): Promise<EntityModel<EntityModel<Constructor>[]>>

    /**
     * Get all the {@link Field}s present in {@link ClassOrInterface} or {@link Enum}
     * @param id of {@link ClassOrInterface} or {@link Enum}
     */
    getFields(id: number): Promise<EntityModel<EntityModel<Field>[]>>

    /**
     * Get all the {@link EnumConstant}s present in {@link Enum}
     * @param id of {@link Enum}
     */
    getEnumConstants(id: number): Promise<EntityModel<EntityModel<EnumConstant>[]>>

    /**
     * Get Code snippet with given id.
     * @param id id of the body.
     */
    getBody(id: number): Promise<EntityModel<Body>>

    /**
     * Get Code snippet with given parent id.
     * @param id id of parent of the {@link Body}
     */
    getBodyByParentId(id: number): Promise<EntityModel<Body>>

    /**
     * Get {@link ClassOrInterface} with given id.
     * @param id for which {@link ClassOrInterface} is needed.
     */
    getClassOrInterface(id: number): Promise<EntityModel<ClassOrInterface>>

    /**
     * Get {@link Enum} with given id.
     * @param id for which {@link Enum} is needed.
     */
    getEnum(id: number): Promise<EntityModel<Enum>>

    /**
     * Get {@link ClassRelation} with given id.
     * @param id for which {@link ClassRelation} is needed.
     */
    getClassRelation(id: number): Promise<EntityModel<ClassRelation>>

    /**
     * Get {@link Method} with given id.
     * @param id id of method
     */
    getMethod(id: number): Promise<EntityModel<Method>>

    /**
     * Get call graph of {@link Method} with provided id.
     * @param id of {@link Method} for which you want call graph.
     * @param packageName to scope the call graph
     */
    getCallGraph(id: number, packageName: string): Promise<EntityModel<EntityModel<CallGraphRelation>[]>>

    /**
     * Get {@link Constructor} with given id.
     * @param id id of {@link Constructor}
     */
    getConstructor(id: number): Promise<EntityModel<Constructor>>

    /**
     * Get {@link Field} with given id.
     * @param id id of {@link Field}
     */
    getField(id: number): Promise<EntityModel<Field>>

    /**
     * Get {@link EnumConstant} with given id.
     * @param id id of {@link EnumConstant}
     */
    getEnumConstant(id: number): Promise<EntityModel<EnumConstant>>

    /**
     * Get generated class diagram in SVG format.
     *
     * @param retryLimit No of times to retry before throwing exception for 202 HTTP.
     */
    getUMLSvg(retryLimit: number): Promise<String>

    /**
     * Delete parsed java code base on the server.
     */
    delete(): void
}