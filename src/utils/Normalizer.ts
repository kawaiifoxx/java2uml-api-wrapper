import {EntityModel} from "../interfaces/EntityModel";
import {ProjectInfo} from "../interfaces/ProjectInfo";
import {AxiosResponse} from "axios";

/**
 * A set of util functions used to map received json responses to Model Interfaces.
 */
export namespace normalizer {
    /**
     * Maps received val to {@link ProjectInfo}
     * @param val should have properties which are present in {@link ProjectInfo}
     * @private
     */
    export function normalizeToProjectInfo(val: AxiosResponse): EntityModel<ProjectInfo> {
        return {
            content: {
                id: val.data.id,
                projectName: val.data.projectName,
                size: val.data.size,
                fileType: val.data.fileType,
                messages: val.data.messages,
                isBadRequest: val.data.badRequest,
                isParsed: val.data.parsed
            },
            _links: val.data._links
        }
    }
}