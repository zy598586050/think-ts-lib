"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
/*
 * @Author: zhangyu
 * @Date: 2023-10-18 10:15:00
 * @LastEditTime: 2023-10-18 10:17:39
 */
var ErrorCode;
(function (ErrorCode) {
    ErrorCode[ErrorCode["ERROR_CODE"] = 10000] = "ERROR_CODE";
    ErrorCode[ErrorCode["ERROR_ROUTE"] = 20000] = "ERROR_ROUTE";
    ErrorCode[ErrorCode["ERROR_VALIDATE"] = 30000] = "ERROR_VALIDATE";
    ErrorCode[ErrorCode["ERROR_TOKEN"] = 30001] = "ERROR_TOKEN";
    ErrorCode[ErrorCode["ERROR_MYSQL"] = 40000] = "ERROR_MYSQL";
    ErrorCode[ErrorCode["ERROR_REDIS"] = 50000] = "ERROR_REDIS";
    ErrorCode[ErrorCode["ERROR_ES"] = 60000] = "ERROR_ES";
    ErrorCode[ErrorCode["ERROR_MONGODB"] = 70000] = "ERROR_MONGODB";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
