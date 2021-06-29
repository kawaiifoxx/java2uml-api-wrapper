import {LightWeight} from "./LightWeight";

/**
 * An interface representing ClassOrInterface in j2u
 *
 * @author kawaiifoxx
 */
export interface ClassOrInterface extends LightWeight {
    packageName: string
    isClass: boolean
    isExternal: boolean
    body?: Body
}
