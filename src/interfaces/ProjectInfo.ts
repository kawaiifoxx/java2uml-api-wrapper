/**
 * Entity interface representing project info
 */
import {Source} from "./Source";

export interface ProjectInfo {
    projectName: string
    size: number
    fileType: string
    messages: string[]
    isBadRequest: boolean
    isParsed: boolean
    source?: Source
}