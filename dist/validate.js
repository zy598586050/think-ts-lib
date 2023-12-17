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
        if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)))
            HttpException(ctx, message || `${key}邮箱格式不正确`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
    },
    // 手机号校验
    phone: (ctx, key, value, message) => {
        if (!(/^[1][3,4,5,7,8][0-9]{9}$/.test(value)))
            HttpException(ctx, message || `${key}手机号格式不正确`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
    },
    // 身份证验证
    idCard: (ctx, key, value, message) => {
        if (!(/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}([0-9]|X)$/.test(value)))
            HttpException(ctx, message || `${key}身份证格式不正确`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
    },
    // 正整形数字类型校验
    number: (ctx, key, value, message) => {
        if (!(/^\d+$/.test(value) && parseInt(value, 10) > 0))
            HttpException(ctx, message || `${key}必须为正整数类型`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
    },
    // 验证某个字段的值是否在某个范围
    in: (ctx, key, value, message) => {
        if (!ctx.vv.includes(value))
            HttpException(ctx, message || `${ctx.vv}中不包含${key}的值`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
    },
    // 验证某个字段的值不在某个范围
    notIn: (ctx, key, value, message) => {
        if (ctx.vv.includes(value))
            HttpException(ctx, message || `${ctx.vv}中包含${key}的值`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
    },
    // 验证某个字段是否和另外一个字段的值一致
    confirm: (ctx, key, value, message) => {
        if (ctx.vv !== value)
            HttpException(ctx, message || `${key}和${ctx.vk}值不一致`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
    }
};
/**
 * 验证器
 * @param ctx 上下文
 * @param key 当前验证的键
 * @param params 请求的入参
 * @param validateObj 验证器对象
 */
const Validate = (ctx, key, params, validateObj) => {
    if (validateObj?.scene?.[ctx.fnName]?.length > 0 && !validateObj?.scene?.[ctx.fnName].includes(key))
        return;
    if (typeof validateObj.rule[key] === 'function') {
        // 自定义验证
        validateObj.rule[key](params?.[key], (msg, errorCode = errorcode_1.ErrorCode.ERROR_VALIDATE, statusCode = 400) => {
            HttpException(ctx, msg, errorCode, statusCode);
        }, params);
    }
    else if (typeof validateObj.rule[key] === 'string') {
        validateObj.rule[key].split('|').reverse().forEach((k) => {
            k = k.replace(/\s/g, '');
            if (k.includes(':')) {
                ctx.vk = k.split(':')[0];
                ctx.vv = validateObj.rule.hasOwnProperty(k.split(':')[1]) ? params[k.split(':')[1]] : k.split(':')[1].split(',');
                k = k.split(':')[0];
            }
            if (rule.hasOwnProperty(k)) {
                rule[k](ctx, key, params?.[key], validateObj?.message?.[validateObj?.message?.hasOwnProperty(`${key}.${k}`) ? `${key}.${k}` : key]);
            }
            else {
                HttpException(ctx, `验证规则${k}为空或不存在`, errorcode_1.ErrorCode.ERROR_VALIDATE, 400);
            }
        });
    }
};
exports.Validate = Validate;
