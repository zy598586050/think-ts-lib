/*
 * @Author: zhangyu
 * @Date: 2023-11-13 11:44:44
 * @LastEditTime: 2023-12-17 12:03:55
 */
import { Context } from 'koa'
import { ErrorCode } from './errorcode'

interface VALIDATE {
    rule: any
    message: any
    scene: any
}

const HttpException = (ctx: Context, msg: string, errorCode: number, statusCode: number) => {
    ctx.body = {
        msg,
        errorCode
    }
    ctx.status = statusCode
}

const rule: any = {
    // 必填校验
    require: (ctx: Context, key: string, value: string, message: string) => {
        if (!value) HttpException(ctx, message || `${key}不能为空`, ErrorCode.ERROR_VALIDATE, 400)
    },
    // 邮箱校验
    email: (ctx: Context, key: string, value: string, message: string) => {
        if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) HttpException(ctx, message || `${key}邮箱格式不正确`, ErrorCode.ERROR_VALIDATE, 400)
    },
    // 手机号校验
    phone: (ctx: Context, key: string, value: string, message: string) => {
        if (!(/^[1][3,4,5,7,8][0-9]{9}$/.test(value))) HttpException(ctx, message || `${key}手机号格式不正确`, ErrorCode.ERROR_VALIDATE, 400)
    },
    // 身份证验证
    idCard: (ctx: Context, key: string, value: string, message: string) => {
        if (!(/^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}([0-9]|X)$/.test(value))) HttpException(ctx, message || `${key}身份证格式不正确`, ErrorCode.ERROR_VALIDATE, 400)
    },
    // 正整形数字类型校验
    number: (ctx: Context, key: string, value: string, message: string) => {
        if (!(/^\d+$/.test(value) && parseInt(value, 10) > 0)) HttpException(ctx, message || `${key}必须为正整数类型`, ErrorCode.ERROR_VALIDATE, 400)
    },
    // 验证某个字段的值是否在某个范围
    in: (ctx: Context, key: string, value: string, message: string) => {
        if (!ctx.vv.includes(value)) HttpException(ctx, message || `${ctx.vv}中不包含${key}的值`, ErrorCode.ERROR_VALIDATE, 400)
    },
    // 验证某个字段的值不在某个范围
    notIn: (ctx: Context, key: string, value: string, message: string) => {
        if (ctx.vv.includes(value)) HttpException(ctx, message || `${ctx.vv}中包含${key}的值`, ErrorCode.ERROR_VALIDATE, 400)
    },
    // 验证某个字段是否和另外一个字段的值一致
    confirm: (ctx: Context, key: string, value: string, message: string) => {
        if (ctx.vv !== value) HttpException(ctx, message || `${key}和${ctx.vk}值不一致`, ErrorCode.ERROR_VALIDATE, 400)
    }
}

/**
 * 验证器
 * @param ctx 上下文
 * @param key 当前验证的键
 * @param params 请求的入参
 * @param validateObj 验证器对象
 */
export const Validate = (ctx: Context, key: string, params: any, validateObj: VALIDATE) => {
    if (validateObj?.scene?.[ctx.fnName]?.length > 0 && !validateObj?.scene?.[ctx.fnName].includes(key)) return
    if (typeof validateObj.rule[key] === 'function') {
        // 自定义验证
        validateObj.rule[key](params?.[key], (msg: string, errorCode: number = ErrorCode.ERROR_VALIDATE, statusCode: number = 400) => {
            HttpException(ctx, msg, errorCode, statusCode)
        }, params)
    } else if (typeof validateObj.rule[key] === 'string') {
        validateObj.rule[key].split('|').reverse().forEach((k: string) => {
            k = k.replace(/\s/g, '')
            if (k.includes(':')) {
                ctx.vk = k.split(':')[0]
                ctx.vv = validateObj.rule.hasOwnProperty(k.split(':')[1]) ? params[k.split(':')[1]] : k.split(':')[1].split(',')
                k = k.split(':')[0]
            }
            if (rule.hasOwnProperty(k)) {
                rule[k](ctx, key, params?.[key], validateObj?.message?.[validateObj?.message?.hasOwnProperty(`${key}.${k}`) ? `${key}.${k}` : key])
            } else {
                HttpException(ctx, `验证规则${k}为空或不存在`, ErrorCode.ERROR_VALIDATE, 400)
            }
        })
    }
}