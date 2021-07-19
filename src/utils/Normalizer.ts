import {EntityModel} from "../interfaces/EntityModel";
import {ProjectInfo} from "../interfaces/ProjectInfo";
import {AxiosResponse} from "axios";
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
            _links: mapOf(val.data._links)
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

            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to {@link UMLBody}
     * @param val should have properties which are present in {@link UMLBody}
     * @private
     */
    export function normalizeToUMLBody(val: AxiosResponse<EntityModel<UMLBody>>): EntityModel<UMLBody> {
        return {
            content: {
                content: val.data.content.content
            },
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to {@link ClassOrInterface}
     * @param val should have properties which are present in {@link ClassOrInterface}
     * @private
     */
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
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to {@link Enum}
     * @param val should have properties which are present in {@link Enum}
     * @private
     */
    export function normalizeToEnum(val: AxiosResponse): EntityModel<Enum> {
        return {
            content: {
                id: val.data.id,
                name: val.data.name,
                packageName: val.data.packageName
            },
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to {@link ClassRelation}
     * @param val should have properties which are present in {@link ClassRelation}
     * @private
     */
    export function normalizeToClassRelation(val: AxiosResponse): EntityModel<ClassRelation> {
        const classRelation = {
            content: {
                id: val.data.id,
                relation: val.data.relationsSymbol,
            } as ClassRelation,
            _links: mapOf(val.data._links)
        }

        const links = classRelation._links
        if (links.has("from")) classRelation.content.fromId = extractIdFromLink(links.get("from")!!)
        if (links.has("to")) classRelation.content.toId = extractIdFromLink(links.get("to")!!)

        return classRelation
    }

    /**
     * Maps received val to {@link Method}
     * @param val should have properties which are present in {@link Method}
     * @private
     */
    export function normalizeToMethod(val: AxiosResponse): EntityModel<Method> {
        return {
            content: {
                id: val.data.id,
                name: val.data.name,
                returnType: val.data.returnType,
                signature: val.data.signature,
                visibility: val.data.visibility,
                parameters: val.data.methodParameters,
                typeParameters: val.data.methodTypeParameters,
                specifiedExceptions: val.data.specifiedExceptions,
                isStatic: val.data.isStatic
            },
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to {@link Constructor}
     * @param val should have properties which are present in {@link Constructor}
     * @private
     */
    export function normalizeToConstructor(val: AxiosResponse): EntityModel<Constructor> {
        return {
            content: {
                id: val.data.id,
                name: val.data.name,
                compilerGenerated: val.data.compilerGenerated,
                signature: val.data.signature,
                visibility: val.data.visibility,
                parameters: val.data.constructorParameters,
                typeParameters: val.data.constructorTypeParameters,
                specifiedExceptions: val.data.constructorSpecifiedExceptions
            },
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to {@link Field}
     * @param val should have properties which are present in {@link Field}
     * @private
     */
    export function normalizeToField(val: AxiosResponse): EntityModel<Field> {
        return {
            content: {
                id: val.data.id,
                typeName: val.data.typeName,
                name: val.data.name,
                visibility: val.data.visibility,
                isStatic: val.data.static
            },
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to {@link EnumConstant}
     * @param val should have properties which are present in {@link EnumConstant}
     * @private
     */
    export function normalizeToEnumConstant(val: AxiosResponse): EntityModel<EnumConstant> {
        return {
            content: {
                id: val.data.id,
                name: val.data.name
            },
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to {@link EnumConstant}
     * @param val should have properties which are present in {@link EnumConstant}
     * @private
     */
    export function normalizeToBody(val: AxiosResponse): EntityModel<Body> {
        return {
            content: {
                id: val.data.id,
                name: 'code',
                content: val.data.content
            },
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to a EntityModel consisting a list of {@link ClassOrInterface}
     * @param val should contain a list of {@link ClassOrInterface} in _embedded
     * @private
     */
    export function normalizeToClassOrInterfaceList(val: AxiosResponse): EntityModel<EntityModel<ClassOrInterface>[]> {
        return {
            content: val.data._embedded.classOrInterfaceList
                .map((e: any) => normalizeToClassOrInterface({data: e} as AxiosResponse)),
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to a EntityModel consisting a list of {@link Enum}
     * @param val should contain a list of {@link Enum} in _embedded
     * @private
     */
    export function normalizeToEnumList(val: AxiosResponse): EntityModel<EntityModel<Enum>[]> {
        return {
            content: val.data._embedded.enumLWList.map((e: any) => normalizeToEnum({data: e} as AxiosResponse)),
            _links: mapOf(val.data._links)
        };
    }

    /**
     * Maps received val to a EntityModel consisting a list of {@link ClassRelation}
     * @param val should contain a list of {@link ClassRelation} in _embedded
     * @private
     */
    export function normalizeToClassRelationList(val: AxiosResponse): EntityModel<EntityModel<ClassRelation>[]> {
        return {
            content: val.data._embedded.classRelationList.map((e: any) => normalizeToClassRelation({data: e} as AxiosResponse)),
            _links: mapOf(val.data._links)
        };
    }

    /**
     * Maps received val to a EntityModel consisting a list of {@link Method}
     * @param val should contain a list of {@link Method} in _embedded
     * @private
     */
    export function normalizeToMethodList(val: AxiosResponse): EntityModel<EntityModel<Method>[]> {
        return {
            content: val.data._embedded.methodList.map((e: any) => normalizeToMethod({data: e} as AxiosResponse)),
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to a EntityModel consisting a list of {@link Constructor}
     * @param val should contain a list of {@link Constructor} in _embedded
     * @private
     */
    export function normalizeToConstructorList(val: AxiosResponse): EntityModel<EntityModel<Constructor>[]> {
        return {
            content: val.data._embedded.constructorList.map((e: any) => normalizeToConstructor({data: e} as AxiosResponse)),
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to a EntityModel consisting a list of {@link Field}
     * @param val should contain a list of {@link Field} in _embedded
     * @private
     */
    export function normalizeToFieldList(val: AxiosResponse): EntityModel<EntityModel<Field>[]> {
        return {
            content: val.data._embedded.fieldList.map((e: any) => normalizeToField({data: e} as AxiosResponse)),
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to a EntityModel consisting a list of {@link EnumConstant}
     * @param val should contain a list of {@link EnumConstant} in _embedded
     * @private
     */
    export function normalizeToEnumConstantList(val: AxiosResponse): EntityModel<EntityModel<EnumConstant>[]> {
        return {
            content: val.data._embedded.enumConstantList.map((e: any) => normalizeToEnumConstant({data: e} as AxiosResponse)),
            _links: mapOf(val.data._links)
        }
    }

    /**
     * Maps received val to a EntityModel consisting a list of {@link CallGraphRelation}
     * @param val should contain a list of {@link CallGraphRelation} in _embedded
     * @private
     */
    export function normalizeToCallGraph(val: AxiosResponse): EntityModel<EntityModel<CallGraphRelation>[]> {
        return {
            content: val.data._embedded.callGraphRelationList.map((e: any) => {
                return {
                    content: {
                        from: e.from,
                        to: e.to
                    },
                    _links: mapOf(e._links)
                } as EntityModel<CallGraphRelation>
            }),
            _links: mapOf(val.data._links)
        }
    }


    /*===========================================================================*
     *                             HELPER METHODS                                *
     *===========================================================================*/

    /**
     * Parses link and returns id associated with it if present.
     * @param link from which id will be extracted.
     * @private
     * @return id in link, if no id is present then Throws Error.
     */
    function extractIdFromLink(link: String): number {
        const list = link.split('/')
        const id = parseInt(list[list.length - 1], 10)

        if (isNaN(id)) throw Error('Id not present in the given link.')
        return id;
    }

    function mapOf(links: object): Map<string, string> {
        return new Map(Object.entries(links).map(e => [e[0], e[1].href]))
    }
}