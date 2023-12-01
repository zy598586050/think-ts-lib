export interface ErrorType {
    msg: string;
    errorCode: number;
    statusCode: number;
}
export declare class HttpException extends Error {
    msg: string;
    errorCode: number;
    statusCode: number;
    constructor(obj: ErrorType);
}
