import {ClassOrInterface} from "./ClassOrInterface";
import {Enum} from "./Enum";
import {ProjectInfo} from "./ProjectInfo";
import {ClassRelation} from "./ClassRelation";
import {LightWeight} from "./LightWeight";


/**
 * A interface representing Project Model of a parsed project
 *
 * @author kawaiifoxx
 */
export interface Source extends LightWeight {
    classOrInterfaces: ClassOrInterface[]
    enums: Enum[]
    classRelations: ClassRelation[]
    projectInfo: ProjectInfo
}