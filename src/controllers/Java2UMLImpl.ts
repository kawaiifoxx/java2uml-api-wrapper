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


// @ts-ignore
export class Java2UMLImpl implements Java2UML {
    private static FILE_UPLOAD = "/files"
    private static PROJECT_INFO = "/project-info"
    private static SOURCE = "/source"
    private static SOURCE_BY_PROJECT_INFO_ID = "/source/by-project-info"
    private static PUML_CODE = "/uml/plant-uml-code"
    private static ALL_CLASS_OR_INTERFACE = "/class-or-interface/by-source"
    private static CLASS_DIAGRAM_SVG = "/uml/svg";


    private projectId: number | null = null;
    private sourceId: number | null = null;
    private http: AxiosInstance;

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
            const axiosResponse = await this.http.get(Java2UMLImpl.ALL_CLASS_OR_INTERFACE + `/${this.sourceId}`)
            return normalizer.normalizeToClassOrInterfaceList(axiosResponse)
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
    private static sleep(ms: number):
        Promise<void> {
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