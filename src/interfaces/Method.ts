import {LightWeight} from "./LightWeight";

/**
 * An interface representing Method in j2u
 */
export interface Method extends LightWeight {
    packageName: string
    returnType: string
    signature: string
    visibility: string
    isStatic: string
    body?: Body
}