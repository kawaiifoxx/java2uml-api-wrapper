import {ProjectInfo} from "./ProjectInfo";
import {LightWeight} from "./LightWeight";


/**
 * A interface representing Project Model of a parsed project
 *
 * @author kawaiifoxx
 */
export interface Source extends LightWeight {
    projectInfo: ProjectInfo
}