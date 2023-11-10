"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorcode_1 = require("./errorcode");
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
        console.log(error);
        ctx.body = {
            msg: error.msg,
            errorCode: error.errorCode
        };
        ctx.status = error.statusCode;
    }
};
