import {LightWeight} from "./LightWeight";
import {Param} from "./Param";
import {TypeParam} from "./TypeParam";
import {SpecifiedException} from "./SpecifiedException";

/**
 * An interface representing constructor in j2u
 *
 * @author kawaiifoxx
 */
export interface Constructor extends LightWeight {
    signature: string
    visibility: string
    compilerGenerated: boolean
    parameters: Array<Param>
    typeParameters: Array<TypeParam>
    specifiedExceptions: Array<SpecifiedException>
    body?: Body
}