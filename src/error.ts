/*
 * @Author: zhangyu
 * @Date: 2023-10-17 20:10:53
 * @LastEditTime: 2023-11-14 12:13:04
 */
import { Context } from 'koa'
import { ErrorCode } from './errorcode'
import { getConfig } from './config'
import Log4j from './log4j'

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
        getConfig().app.enableLog && Log4j(error, 'error')
        ctx.body = {
            msg: error.msg,
            errorCode: error.errorCode
        }
        ctx.status = error.statusCode
    }
}