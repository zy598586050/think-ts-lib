/*
 * @Author: zhangyu
 * @Date: 2023-10-21 18:30:58
 * @LastEditTime: 2023-10-21 18:49:24
 */

export interface ErrorType {
    msg: string
    errorCode: number
    statusCode: number
}

// 统一异常格式
export class HttpException extends Error {
    msg: string
    errorCode: number
    statusCode: number
    constructor(obj: ErrorType) {
        super()
        this.msg = obj.msg
        this.errorCode = obj.errorCode
        this.statusCode = obj.statusCode
    }
}