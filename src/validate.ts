/*
 * @Author: zhangyu
 * @Date: 2023-11-13 11:44:44
 * @LastEditTime: 2023-11-13 19:43:58
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
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) HttpException(ctx, message || `${key}手机号格式不正确`, ErrorCode.ERROR_VALIDATE, 400)
    },
    // 手机号校验
    phone: (ctx: Context, key: string, value: string, message: string) => {
        const phoneRegex = /^[1][3,4,5,7,8][0-9]{9}$/
        if (!phoneRegex.test(value)) HttpException(ctx, message || `${key}邮箱格式不正确`, ErrorCode.ERROR_VALIDATE, 400)
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
        validateObj.rule[key](validateObj.rule[key], (msg: string, errorCode: number = ErrorCode.ERROR_VALIDATE, statusCode: number = 400) => {
            HttpException(ctx, msg, errorCode, statusCode)
        }, params)
    } else if (typeof validateObj.rule[key] === 'string') {
        validateObj.rule[key].split('|').forEach((k: string) => {
            if (rule.hasOwnProperty(k)) {
                rule[k](ctx, key, params?.[key], validateObj?.message?.[key])
            } else {
                HttpException(ctx, `验证规则${k}为空或不存在`, ErrorCode.ERROR_VALIDATE, 400)
            }
        })
    }
}