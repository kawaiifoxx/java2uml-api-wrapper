import {LightWeight} from "./LightWeight";
import {TypeParam} from "./TypeParam";

/**
 * An interface representing ClassOrInterface in j2u
 *
 * @author kawaiifoxx
 */
export interface ClassOrInterface extends LightWeight {
    packageName: string
    isClass: boolean
    isExternal: boolean
    isGeneric: boolean
    typeParams: Array<TypeParam>
    body?: Body
}
