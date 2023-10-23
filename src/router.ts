/*
 * @Author: zhangyu
 * @Date: 2023-10-17 15:49:40
 * @LastEditTime: 2023-10-23 23:21:18
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
        // 检测控制器方法是否存在
        hasControllerFun(str)
        router.get(url, async (ctx: Context) => {
            // 动态执行控制器的方法
            // const result: RESULT = await runControllerFun(str)
            // ctx.body = result.body
            // ctx.status = result.status
        })
    }
}

// 动态执行控制器方法
const runControllerFun = async (str: string): Promise<RESULT> => {
    try {
        const strArray = str.split('/')
        const beforePath = strArray.splice(0, strArray.length - 1).join('/')
        const afterPath = strArray[strArray.length - 1]
        const importUrl = path.resolve(process.cwd(), `${config.app.controller_path}${beforePath}.ts`)
        console.log(importUrl)
        await import(importUrl)
    } catch (error) {
        throw new HttpException({
            msg: `路由控制器方法配置有误[${str}]`,
            errorCode: ErrorCode.ERROR_ROUTE,
            statusCode: 500
        })
    }
    return {
        body: {},
        status: 200
    }
}

// 检测控制器方法是否存在
const hasControllerFun = (str: string) => {
    if (str.includes('/')) {
        const strArray = str.split('/')
        const beforePath = strArray.splice(0, strArray.length - 1).join('/')
        if (beforePath) {
            const importUrl = path.resolve(process.cwd(), `${config.app.controller_path}${beforePath}.ts`)
            import(importUrl).then((module) => {
                try {
                    //new module.default()[]
                } catch (error) {
                    throw new HttpException({
                        msg: `路由控制器方法配置有误[${str}]`,
                        errorCode: ErrorCode.ERROR_ROUTE,
                        statusCode: 500
                    })
                }
            }).catch(() => {
                throw new HttpException({
                    msg: `路由控制器方法配置有误[${str}]`,
                    errorCode: ErrorCode.ERROR_ROUTE,
                    statusCode: 500
                })
            })
        } else {
            throw new HttpException({
                msg: `路由控制器方法配置有误[${str}]`,
                errorCode: ErrorCode.ERROR_ROUTE,
                statusCode: 500
            })
        }
    } else {
        throw new HttpException({
            msg: `路由控制器方法配置有误[${str}]`,
            errorCode: ErrorCode.ERROR_ROUTE,
            statusCode: 500
        })
    }
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