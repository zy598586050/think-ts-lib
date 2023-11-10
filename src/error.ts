/*
 * @Author: zhangyu
 * @Date: 2023-10-17 20:10:53
 * @LastEditTime: 2023-11-10 18:21:30
 */
import { Context } from 'koa'
import { ErrorCode } from './errorcode'

// 统一异常处理
export default async (ctx: Context, next: () => Promise<any>) => {
    try {
        await next()
        if (ctx.status === 404 || ctx.status === 405) {
            ctx.body = {
                msg: '路由不存在, 检查GET,POST,PUT,DELETE是否匹配',
                errorCode: ErrorCode.ERROR_ROUTE
            }
        }
    } catch (error: any) {
        console.log(error)
        ctx.body = {
            msg: error.msg,
            errorCode: error.errorCode
        }
        ctx.status = error.statusCode
    }
}