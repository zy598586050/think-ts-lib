"use strict";
/*
 * @Author: zhangyu
 * @Date: 2023-10-21 18:30:58
 * @LastEditTime: 2023-10-21 18:49:24
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpException = void 0;
// 统一异常格式
class HttpException extends Error {
    msg;
    errorCode;
    statusCode;
    constructor(obj) {
        super();
        this.msg = obj.msg;
        this.errorCode = obj.errorCode;
        this.statusCode = obj.statusCode;
    }
}
exports.HttpException = HttpException;
