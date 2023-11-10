/*
 * @Author: zhangyu
 * @Date: 2023-10-17 15:49:40
 * @LastEditTime: 2023-11-10 19:25:51
 */
import { Context } from 'koa'
import koaRouter from 'koa-router'
import fs from 'fs'
import path from 'path'
import { getConfig } from './config'
import { HttpException } from './exception'
import { ErrorCode } from './errorcode'

interface RESULT {
    body: Object
    status: number
}

const config = getConfig()

export interface RouteType {
    get: (url: string, str: string, middleware?: MiddleWareType) => void
    post: (url: string, str: string, middleware?: MiddleWareType) => void
    put: (url: string, str: string, middleware?: MiddleWareType) => void
    delete: (url: string, str: string, middleware?: MiddleWareType) => void
    group: (prefix: string, callback: any, middleware?: MiddleWareType) => void
}

type METHOD = 'get' | 'post' | 'put' | 'delete'
type MiddleWareType = (ctx: Context, next: () => void, error: (msg?: string, errorCode?: number, statusCode?: number) => void) => void
export type ExceptionType = (msg?: string, errorCode?: number, statusCode?: number) => void

const router = new koaRouter()
const urlArray: string[] = []

// 具体执行的方法
const handleRoute = (method: METHOD, url: string, str: string, middleware?: MiddleWareType) => {
    url = url.startsWith('/') ? url : `/${url}`
    // 检测路由是否重复
    hasRepeatRoute(url)
    // 检测控制器方法是否存在, 存在就返回该方法
    const fn: Promise<(ctx: Context) => Promise<RESULT>> = hasControllerFun(str)
    router[method](url, async (ctx: Context) => {
        // 挂载控制器路径
        ctx.beforePath = str.split('/').slice(0, -1).join('/')
        // 动态执行控制器的方法
        const { body, status } = await (await fn)(ctx)
        // 判断是否有中间件
        if (typeof middleware === 'function') {
            await middleware(ctx, () => {
                ctx.body = body
                ctx.status = status
            }, (msg: string = '请求错误', errorCode: number = 30000, statusCode: number = 400) => {
                throw new HttpException({
                    msg,
                    errorCode,
                    statusCode
                })
            })
        } else {
            ctx.body = body
            ctx.status = status
        }
    })
}

// 路由
const route: RouteType = {
    // GET 路由
    get(url: string, str: string, middleware?: MiddleWareType) {
        handleRoute('get', url, str, middleware)
    },
    // POST 路由
    post(url: string, str: string, middleware?: MiddleWareType) {
        handleRoute('post', url, str, middleware)
    },
    // PUT 路由
    put(url: string, str: string, middleware?: MiddleWareType) {
        handleRoute('put', url, str, middleware)
    },
    // DELETE 路由
    delete(url: string, str: string, middleware?: MiddleWareType) {
        handleRoute('delete', url, str, middleware)
    },
    // 分组路由
    group(prefix: string, callback: any, middleware?: MiddleWareType) {
        callback({
            // GET 路由
            get: (url: string, str: string) => {
                url = url.startsWith('/') ? url : `/${url}`
                this.get(`${prefix}${url}`, str, middleware)
            },
            // POST 路由
            post: (url: string, str: string) => {
                url = url.startsWith('/') ? url : `/${url}`
                this.post(`${prefix}${url}`, str, middleware)
            },
            // PUT 路由
            put: (url: string, str: string) => {
                url = url.startsWith('/') ? url : `/${url}`
                this.put(`${prefix}${url}`, str, middleware)
            },
            // DELETE 路由
            delete: (url: string, str: string) => {
                url = url.startsWith('/') ? url : `/${url}`
                this.delete(`${prefix}${url}`, str, middleware)
            }
            // 规定不支持递归分组
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
                }).catch((error) => {
                    console.log(error)
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