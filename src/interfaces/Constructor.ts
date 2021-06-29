import {LightWeight} from "./LightWeight";

/**
 * An interface representing constructor in j2u
 *
 * @author kawaiifoxx
 */
export interface Constructor extends LightWeight {
    signature: string
    visibility: string
    compilerGenerated: boolean
    body?: Body
}