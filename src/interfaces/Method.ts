import {LightWeight} from "./LightWeight";
import {Param} from "./Param";
import {TypeParam} from "./TypeParam";
import {SpecifiedException} from "./SpecifiedException";

/**
 * An interface representing Method in j2u
 */
export interface Method extends LightWeight {
    returnType: string
    signature: string
    visibility: string
    isStatic: string
    parameters: Array<Param>
    typeParameters: Array<TypeParam>
    specifiedExceptions: Array<SpecifiedException>
    body?: Body
}