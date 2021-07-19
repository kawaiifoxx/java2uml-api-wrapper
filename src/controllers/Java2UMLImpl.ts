import {EntityModel} from "../interfaces/EntityModel";
import {ProjectInfo} from "../interfaces/ProjectInfo";
import axios, {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import {Java2UMLConfig} from "./Java2UMLConfig";
import {ReadStream} from "fs";
import FormData from "form-data"
import {j2ULogger} from "../config/loggerConfig/loggerConfig";
import {normalizer} from "../utils/Normalizer";
import {Java2UML} from "./Java2UML";
import {Source} from "../interfaces/Source";
import {UMLBody} from "../interfaces/UMLBody";
import {ClassOrInterface} from "../interfaces/ClassOrInterface";
import {Enum} from "../interfaces/Enum";
import {ClassRelation} from "../interfaces/ClassRelation";
import {Method} from "../interfaces/Method";
import {Constructor} from "../interfaces/Constructor";
import {Field} from "../interfaces/Field";
import {EnumConstant} from "../interfaces/EnumConstant";
import {Body} from "../interfaces/Body";
import {CallGraphRelation} from "../interfaces/CallGraphRelation";


// @ts-ignore
export class Java2UMLImpl implements Java2UML {
    private static FILE_UPLOAD = "/files"
    private static PROJECT_INFO = "/project-info"
    private static SOURCE = "/source"
    private static SOURCE_BY_PROJECT_INFO_ID = "/source/by-project-info"
    private static PUML_CODE = "/uml/plant-uml-code"
    private static BY_SOURCE = "/by-source"
    private static CLASS_OR_INTERFACE = "/class-or-interface"
    private static RELATION = "/relation"
    private static CLASS_DIAGRAM_SVG = "/uml/svg"
    private static ENUM = "/enum"
    private static METHOD = "/method"
    private static BY_PARENT = "/by-parent"
    private static CONSTRUCTOR = "/constructor"
    private static FIELDS = "/field"
    private static ENUM_CONSTANT = "/enum-constant"
    private static CODE_SNIPPET = "/body"
    private static CALL_GRAPH = "/call-graph"

    private projectId: number | null = null
    private sourceId: number | null = null
    private http: AxiosInstance

    constructor(config: Java2UMLConfig) {
        this.http = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout,
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
            validateStatus: status => {
                if (status == 202) return false
                return status < 400
            },
            headers: config.headers
        })
    }

    async upload(
        file: File | ReadStream,
        onProgress: (progressEvent: ProgressEvent) => void = (_ => _)
    ): Promise<EntityModel<ProjectInfo>> {
        const formData = new FormData()
        formData.append('file', file)

        try {
            const axiosResponse = await this.http.post<EntityModel<ProjectInfo>>(
                Java2UMLImpl.FILE_UPLOAD,
                formData,
                {
                    onUploadProgress: onProgress,
                    headers: formData.getHeaders()
                }
            )
            const projectInfo = normalizer.normalizeToProjectInfo(axiosResponse)
            this.projectId = projectInfo.content.id
            this.sourceId = null
            return projectInfo

        } catch (e) {
            Java2UMLImpl.logError(e);
            throw e
        }
    }

    async getProjectInfo(): Promise<EntityModel<ProjectInfo>> {
        this.assertThatProjectIdIsNotNull()

        try {
            const axiosResponse = await this.http.get(Java2UMLImpl.PROJECT_INFO + `/${this.projectId}`)
            return normalizer.normalizeToProjectInfo(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }
    }

    async getSource(retryLimit: number = 10): Promise<EntityModel<Source>> {
        this.assertThatProjectIdIsNotNull()

        try {
            let axiosResponse: AxiosResponse<EntityModel<Source>>

            if (this.sourceId === null) {
                axiosResponse = await this.http.get(Java2UMLImpl.SOURCE_BY_PROJECT_INFO_ID + `/${this.projectId}`)
            } else {
                axiosResponse = await this.http.get(Java2UMLImpl.SOURCE + `/${this.sourceId}`)
            }

            this.sourceId = (axiosResponse.data as any).id
            return normalizer.normalizeToSource(axiosResponse);
        } catch (e) {
            if (e.response && e.response.status == 202) {
                const source = await this.handle202(e, retryLimit,
                    Java2UMLImpl.SOURCE_BY_PROJECT_INFO_ID + `/${this.projectId}`, normalizer.normalizeToSource)
                this.sourceId = source.content.id
                return source
            }

            Java2UMLImpl.logError(e)
            throw e
        }
    }

    async getPlantUMLCode(retryLimit: number = 10): Promise<EntityModel<UMLBody>> {
        this.assertThatProjectIdIsNotNull()

        const uri = Java2UMLImpl.PUML_CODE + `/${this.projectId}`;
        try {
            const axiosResponse = await this.http.get(uri)
            return normalizer.normalizeToUMLBody(axiosResponse)
        } catch (e) {
            if (e.response.status == 202)
                return await this.handle202(e, retryLimit, uri, normalizer.normalizeToUMLBody);

            Java2UMLImpl.logError(e)
            throw e
        }
    }


    async getUMLSvg(retryLimit: number = 10): Promise<String> {
        this.assertThatProjectIdIsNotNull()

        const uri = Java2UMLImpl.CLASS_DIAGRAM_SVG + `/${this.projectId}`;
        try {
            const axiosResponse = await this.http.get(uri)
            return axiosResponse.data
        } catch (e) {
            if (e.response && e.response.status == 202)
                return await this.handle202(e, retryLimit, uri, e => e.data)

            Java2UMLImpl.logError(e)
            throw  e
        }
    }

    async getClassOrInterfaces(): Promise<EntityModel<EntityModel<ClassOrInterface>[]>> {
        await this.getSourceIfNull()

        try {
            const axiosResponse =
                await this.http.get(`${Java2UMLImpl.CLASS_OR_INTERFACE}${Java2UMLImpl.BY_SOURCE}/${this.sourceId}`)

            return normalizer.normalizeToClassOrInterfaceList(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }
    }

    async getEnums(): Promise<EntityModel<EntityModel<Enum>[]>> {
        await this.getSourceIfNull()

        try {
            const axiosResponse = await this.http.get(`${Java2UMLImpl.ENUM}${Java2UMLImpl.BY_SOURCE}/${this.sourceId}`)
            return normalizer.normalizeToEnumList(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }
    }

    async getClassRelations(): Promise<EntityModel<EntityModel<ClassRelation>[]>> {
        await this.getSourceIfNull()

        try {
            const axiosResponse = await this.http.get(`${Java2UMLImpl.RELATION}${Java2UMLImpl.BY_SOURCE}/${this.sourceId}`)
            return normalizer.normalizeToClassRelationList(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }
    }

    async getMethods(id: number): Promise<EntityModel<EntityModel<Method>[]>> {
        await this.getSourceIfNull()

        try {
            const axiosResponse = await this.http.get(`${Java2UMLImpl.METHOD}${Java2UMLImpl.BY_PARENT}/${id}`)
            return normalizer.normalizeToMethodList(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }

    }

    async getConstructors(id: number): Promise<EntityModel<EntityModel<Constructor>[]>> {
        await this.getSourceIfNull()

        try {
            const axiosResponse = await this.http.get(`${Java2UMLImpl.CONSTRUCTOR}${Java2UMLImpl.BY_PARENT}/${id}`)
            return normalizer.normalizeToConstructorList(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }
    }

    async getFields(id: number): Promise<EntityModel<EntityModel<Field>[]>> {
        await this.getSourceIfNull()

        try {
            const axiosResponse = await this.http.get(`${Java2UMLImpl.FIELDS}${Java2UMLImpl.BY_PARENT}/${id}`)
            return normalizer.normalizeToFieldList(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }
    }

    async getEnumConstants(id: number): Promise<EntityModel<EntityModel<EnumConstant>[]>> {
        await this.getSourceIfNull()

        try {
            const axiosResponse = await this.http.get(`${Java2UMLImpl.ENUM_CONSTANT}${Java2UMLImpl.BY_PARENT}/${id}`)
            return normalizer.normalizeToEnumConstantList(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }
    }

    async getBodyByParentId(id: number): Promise<EntityModel<Body>> {
        await this.getSourceIfNull()

        try {
            const axiosResponse = await this.http.get(`${Java2UMLImpl.CODE_SNIPPET}${Java2UMLImpl.BY_PARENT}/${id}`)
            return normalizer.normalizeToBody(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }
    }

    async getBody(id: number): Promise<EntityModel<Body>> {
        await this.getSourceIfNull()

        try {
            const axiosResponse = await this.http.get(`${Java2UMLImpl.CODE_SNIPPET}/${id}`)
            return normalizer.normalizeToBody(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }
    }

    async getCallGraph(id: number, packageName: string = ""): Promise<EntityModel<EntityModel<CallGraphRelation>[]>> {
        await this.getSourceIfNull()

        try {
            const axiosResponse = await this.http.get(`${Java2UMLImpl.CALL_GRAPH}/${id}?package=${packageName}`)
            return normalizer.normalizeToCallGraph(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }
    }


    /*================================================================================*
     *                              HELPER METHODS                                    *
     *================================================================================*/


    /**
     * Handles Http 202 error.
     * @param e AxiosError.
     * @param retry number of times to retry.
     * @param uri resource for which you want to handle 202.
     * @type T Type of resource
     * @param normalize a converter which converts response to resource.
     * @private
     */
    private async handle202<T>(e: AxiosError, retry: number, uri: string, normalize: (res: AxiosResponse<T>) => T): Promise<T> {
        for (let i = 0; i < retry; i++) {
            try {
                const axiosResponse = await this.http.get(uri)
                if (axiosResponse.status == 200) return normalize(axiosResponse)
            } catch (_) {
                await Java2UMLImpl.sleep(500)
                j2ULogger.info(`${i + 1} try, received STATUS: 202, retrying after 500ms.`)
            }
        }

        throw e
    }

    private static logError(e: any) {
        if ("isAxiosError" in e && e.isAxiosError) {
            j2ULogger.error(e)
        } else {
            j2ULogger.error("An unknown error occurred.", e)
        }
    }

    assertThatProjectIdIsNotNull() {
        if (this.projectId === null) {
            throw Error(`Project Id is null, please upload a file using Java2UML.upload()`)
        }
    }


    /**
     * Sleeps for given period of time.
     * @param ms time to sleep in milliseconds.
     * @private
     */
    private static sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

    /**
     * Retrieves source id if null.
     * @private
     */
    private async getSourceIfNull() {
        if (this.sourceId != null) return
        await this.getSource()
    }
}