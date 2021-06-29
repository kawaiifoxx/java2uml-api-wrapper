import {LightWeight} from "./LightWeight";


/**
 * Defines a relation between two classes.
 *
 * @author kawaiifoxx
 */
export interface ClassRelation {
    from: LightWeight
    to: LightWeight
    relation: string
    id: number
}