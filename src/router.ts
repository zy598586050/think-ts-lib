/*
 * @Author: zhangyu
 * @Date: 2023-10-17 15:49:40
 * @LastEditTime: 2023-10-24 14:57:37
 */
import { Context } from 'koa'
import koaRouter from 'koa-router'
import * as fs from 'fs'
import * as path from 'path'
import { getConfig } from './config'
import { HttpException } from './exception'
import { ErrorCode } from './errorcode'

interface RESULT {
    body: Object
    status: number
}

const config = getConfig()

export interface RouteType {
    get: (url: string, str: string, middleware?: () => void) => void
}

const router = new koaRouter()
const urlArray: string[] = []
const route: RouteType = {
    // GET路由
    get(url: string, str: string, middleware?: () => void) {
        // 检测路由是否重复
        hasRepeatRoute(url)
        // 检测控制器方法是否存在, 存在就返回该方法
        const fn: Promise<(ctx: Context) => Promise<RESULT>> = hasControllerFun(str)
        router.get(url, async (ctx: Context) => {
            // 动态执行控制器的方法
            const { body, status } = await (await fn)(ctx)
            ctx.body = body
            ctx.status = status
        })
    }
}

// 检测控制器方法是否存在
const hasControllerFun = async (str: string): Promise<(ctx: Context) => Promise<RESULT>> => {
    let fn = null
    if (!str.includes('/')) {
        throw new HttpException({
            msg: `路由控制器方法配置有误[${str}]`,
            errorCode: ErrorCode.ERROR_ROUTE,
            statusCode: 500
        })
    }

    const strArray = str.split('/')
    const beforePath = strArray.slice(0, -1).join('/')
    const importUrl = path.resolve(process.cwd(), `${config.app.controller_path}/${beforePath}.ts`)

    try {
        const module = await import(importUrl)
        const controller = new module.default()

        if (typeof controller[strArray[strArray.length - 1]] === 'function') {
            fn = controller[strArray[strArray.length - 1]]
        } else {
            throw new HttpException({
                msg: `路由控制器方法配置有误[${str}]`,
                errorCode: ErrorCode.ERROR_ROUTE,
                statusCode: 500
            })
        }
    } catch (error) {
        console.log(error)
        throw new HttpException({
            msg: `路由控制器方法配置有误[${str}]`,
            errorCode: ErrorCode.ERROR_ROUTE,
            statusCode: 500
        })
    }
    return fn
}

// 判断路由是否重复
const hasRepeatRoute = (url: string) => {
    if (urlArray.includes(url)) {
        throw new HttpException({
            msg: `路由重复[${url}]`,
            errorCode: ErrorCode.ERROR_ROUTE,
            statusCode: 500
        })
    } else {
        urlArray.push(url)
    }
}

// 加载路由配置
const routeDir = path.resolve(process.cwd(), config.app.route_path)
const loadRoute = (routeDir: string) => {
    // 只有存在该目录才会去合并
    if (fs.existsSync(routeDir) && fs.statSync(routeDir).isDirectory()) {
        fs.readdirSync(routeDir).forEach((file) => {
            const modulePath = path.join(routeDir, file)
            if (fs.statSync(modulePath).isDirectory()) {
                loadRoute(modulePath)
            } else if (file.endsWith('.ts')) {
                import(modulePath).then((module) => {
                    if (module && module.default) {
                        module.default(route)
                    }
                }).catch(() => {
                    throw new HttpException({
                        msg: '路由加载错误',
                        errorCode: ErrorCode.ERROR_ROUTE,
                        statusCode: 500
                    })
                })
            }
        })
    }
}
loadRoute(routeDir)

export default router