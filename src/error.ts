/*
 * @Author: zhangyu
 * @Date: 2023-10-17 20:10:53
 * @LastEditTime: 2023-11-15 19:01:58
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
        getConfig().app.enableLog && Log4j(error, 'error')
        ctx.body = {
            msg: error.msg || error.message,
            errorCode: error.errorCode || error.sqlState
        }
        ctx.status = error.statusCode || 500
    }
}