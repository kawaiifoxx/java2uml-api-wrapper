/**
 * Entity interface representing project info
 */
export interface ProjectInfo {
    projectName: string
    size: number
    fileType: string
    messages: string[]
    isBadRequest: boolean
    isParsed: boolean
}