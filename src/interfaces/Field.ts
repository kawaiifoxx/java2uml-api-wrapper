import {LightWeight} from "./LightWeight";

/**
 * An interface representing Field type in j2u
 *
 * @author kawaiifoxx
 */
export interface Field extends LightWeight {
    typeName: string
    visibility: string
    isStatic: boolean
}