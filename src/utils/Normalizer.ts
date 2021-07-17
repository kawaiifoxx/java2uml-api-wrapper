import {EntityModel} from "../interfaces/EntityModel";
import {ProjectInfo} from "../interfaces/ProjectInfo";
import {AxiosResponse} from "axios";
import {Source} from "../interfaces/Source";
import {UMLBody} from "../interfaces/UMLBody";
import {ClassOrInterface} from "../interfaces/ClassOrInterface";


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


    /**
     * Maps received val to {@link Source}
     * @param val should have properties which are present in {@link Source}
     * @private
     */
    export function normalizeToSource(val: AxiosResponse): EntityModel<Source> {
        return {
            content: {
                id: val.data.id,
                name: 'source'
            },

            _links: val.data._links
        }
    }

    export function normalizeToUMLBody(val: AxiosResponse<EntityModel<UMLBody>>): EntityModel<UMLBody> {
        return {
            content: {
                content: val.data.content.content
            },
            _links: val.data._links
        }
    }

    export function normalizeToClassOrInterface(val: AxiosResponse): EntityModel<ClassOrInterface> {
        return {
            content: {
                id: val.data.id,
                name: val.data.name,
                packageName: val.data.packageName,
                typeParams: val.data.classOrInterfaceTypeParameters,
                isClass: val.data.class,
                isExternal: val.data.external,
                isGeneric: val.data.generic,
            },
            _links: val.data._links
        }
    }

    export function normalizeToClassOrInterfaceList(val: AxiosResponse): EntityModel<EntityModel<ClassOrInterface>[]> {
        return {
            content: val.data._embedded.classOrInterfaceList
                .map((e: any) => normalizeToClassOrInterface({data: e} as AxiosResponse)),
            _links: val.data._links
        }
    }
}