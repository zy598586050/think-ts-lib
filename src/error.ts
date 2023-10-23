/*
 * @Author: zhangyu
 * @Date: 2023-10-17 20:10:53
 * @LastEditTime: 2023-10-21 19:08:40
 */
import { Context } from 'koa'

// 统一异常处理
export default async (ctx: Context, next: () => Promise<any>) => {
    try {
        await next()
    } catch (error: any) {
        ctx.body = {
            msg: error.msg,
            errorCode: error.errorCode
        }
        ctx.status = error.statusCode
    }
}