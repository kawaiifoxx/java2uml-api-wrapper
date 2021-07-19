/**
 * An interface for representing Enum in j2u
 * @author kawaiifoxx
 */
import {LightWeight} from "./LightWeight";

export interface Enum extends LightWeight {
    packageName: string
    body?: Body
}