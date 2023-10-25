"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// 统一异常处理
exports.default = async (ctx, next) => {
    try {
        await next();
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
