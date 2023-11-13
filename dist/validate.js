"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = void 0;
const errorcode_1 = require("./errorcode");
const HttpException = (ctx, msg, errorCode, statusCode) => {
    ctx.body = {
        msg,
        errorCode
    };
    ctx.status = statusCode;
};
const rule = {
    // 必填校验
    require: (ctx, key, value, message) => {
        if (!value)
            HttpException(ctx, message || `${key}不能为空`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
    },
    // 邮箱校验
    email: (ctx, key, value, message) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value))
            HttpException(ctx, message || `${key}手机号格式不正确`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
    },
    // 手机号校验
    phone: (ctx, key, value, message) => {
        const phoneRegex = /^[1][3,4,5,7,8][0-9]{9}$/;
        if (!phoneRegex.test(value))
            HttpException(ctx, message || `${key}邮箱格式不正确`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
    }
};
/**
 * 验证器
 * @param ctx 上下文
 * @param key 当前验证的键
 * @param params 请求的入参数
 * @param validateObj 验证器对象
 */
const Validate = (ctx, key, params, validateObj) => {
    if (validateObj?.scene?.[ctx.fnName]?.length > 0 && !validateObj?.scene?.[ctx.fnName].includes(key))
        return;
    if (typeof validateObj.rule[key] === 'function') {
        // 自定义验证
        validateObj.rule[key](validateObj.rule[key], (msg, errorCode = errorcode_1.ErrorCode.ERROR_VALIDATE, statusCode = 400) => {
            HttpException(ctx, msg, errorCode, statusCode);
        }, params);
    }
    else if (typeof validateObj.rule[key] === 'string') {
        validateObj.rule[key].split('|').forEach((k) => {
            if (rule.hasOwnProperty(k)) {
                rule[k](ctx, key, params?.[key], validateObj?.message?.[key]);
            }
            else {
                HttpException(ctx, `验证规则${k}为空或不存在`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
            }
        });
    }
};
exports.Validate = Validate;
