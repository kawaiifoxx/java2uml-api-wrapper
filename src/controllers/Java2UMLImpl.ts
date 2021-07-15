import {EntityModel} from "../interfaces/EntityModel";
import {ProjectInfo} from "../interfaces/ProjectInfo";
import axios, {AxiosInstance} from "axios";
import {Java2UMLConfig} from "./Java2UMLConfig";
import {ReadStream} from "fs";
import FormData from "form-data"
import {j2ULogger} from "../config/loggerConfig/loggerConfig";
import {normalizer} from "../utils/Normalizer";
import {Java2UML} from "./Java2UML";


// @ts-ignore
export class Java2UMLImpl implements Java2UML {
    private static FILE_UPLOAD = "/files"
    private static PROJECT_INFO = "/project-info"

    // @ts-ignore
    private projectId: number | null = null;
    // @ts-ignore
    private sourceId: number | null = null;
    private http: AxiosInstance;

    constructor(config: Java2UMLConfig) {
        this.http = axios.create({
            baseURL: config.baseURL,
            timeout: config.timeout,
            validateStatus: status => {
                if (status == 202) return false
                if (status == 415) return false
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
        if (this.projectId === null) {
            throw Error(`Project Id is null, please upload a file using Java2UML.upload()`)
        }

        try {
            const axiosResponse = await this.http.get(Java2UMLImpl.PROJECT_INFO + `/${this.projectId}`)
            return normalizer.normalizeToProjectInfo(axiosResponse)
        } catch (e) {
            Java2UMLImpl.logError(e)
            throw e
        }
    }

    private static logError(e: any) {
        if ("isAxiosError" in e && e.isAxiosError) {
            j2ULogger.error(e)
        } else {
            j2ULogger.error("An unknown error occurred.", e)
        }
    }

}