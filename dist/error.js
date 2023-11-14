"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorcode_1 = require("./errorcode");
const config_1 = require("./config");
const log4j_1 = __importDefault(require("./log4j"));
// 统一异常处理
exports.default = async (ctx, next) => {
    try {
        await next();
        if (ctx.status === 404 || ctx.status === 405) {
            ctx.body = {
                msg: '路由不存在, 检查GET,POST,PUT,DELETE是否匹配',
                errorCode: errorcode_1.ErrorCode.ERROR_ROUTE
            };
        }
    }
    catch (error) {
        (0, config_1.getConfig)().app.enableLog && (0, log4j_1.default)(error, 'error');
        ctx.body = {
            msg: error.msg || error.message,
            errorCode: error.errorCode
        };
        ctx.status = error.statusCode || 500;
    }
};
