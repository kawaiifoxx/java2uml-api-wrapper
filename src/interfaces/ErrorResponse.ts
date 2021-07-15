/**
 * An interface for Error response received from server.
 */
export interface ErrorResponse {
    timestamp: string
    httpStatus: string
    reason: string
    errors: string[]
}