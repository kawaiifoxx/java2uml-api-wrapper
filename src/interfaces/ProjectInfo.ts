/**
 * Entity interface representing project info
 */
import {Source} from "./Source";

export interface ProjectInfo {
    id: number
    projectName: string
    size: number
    fileType: string
    messages: string[]
    isBadRequest: boolean
    isParsed: boolean
    source?: Source
}