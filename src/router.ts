/*
 * @Author: zhangyu
 * @Date: 2023-10-17 15:49:40
 * @LastEditTime: 2023-10-18 14:34:31
 */
import { Context } from 'koa'
import koaRouter from 'koa-router'
import * as fs from 'fs'
import * as path from 'path'
import { getConfig } from './config'

const config = getConfig()

export interface RouteType {
    get: (url: string, str: string, middleware: any) => void
}

const router = new koaRouter()
const route: RouteType = {
    // GET路由
    get(url: string, str: string, middleware: any) {
        router.get(url, async (ctx: Context) => {})
    }
}

// 加载路由配置
const routeDir = path.resolve(process.cwd(), config.app.route_path)
// 只有存在该目录才会去合并
if (fs.existsSync(routeDir) && fs.statSync(routeDir).isDirectory()) {
    fs.readdirSync(routeDir).forEach((file) => {
        // 必须为ts文件并且导出了内容
        if (file.endsWith('.ts')) {
            const modulePath = path.join(routeDir, file)
            const moduleContent = require(modulePath)
            if (moduleContent && moduleContent.default) {
                moduleContent.default(route)
            }
        }
    })
}

export default router