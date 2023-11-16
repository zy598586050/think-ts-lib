/*
 * @Author: zhangyu
 * @Date: 2023-10-17 15:43:32
 * @LastEditTime: 2023-11-15 21:19:05
 */
import path from 'path'
import Koa from 'koa'
import KoaBody from 'koa-body'
import KoaStatic from 'koa-static'
import figlet from 'figlet'
import ip from 'ip'
import { getConfig, initConfig } from './config'
import errorHandler from './error'
import router from './router'

const app = new Koa()

export default async (cfg: Record<string, any> = {}) => {
    // 打印ThinkTS
    const result = figlet.textSync('ThinkTS')
    console.log(result)

    console.time('用时')
    await initConfig(cfg?.app?.configPath)
    const mergeConfig = getConfig(cfg)
    app
        .use(errorHandler)
        .use(KoaBody(mergeConfig?.app?.koaBody))
        .use(router.routes())
        .use(router.allowedMethods())
        .use(KoaStatic(path.resolve(process.cwd(), mergeConfig?.app?.static_path)))
        .listen(mergeConfig?.app?.port)
    console.timeEnd('用时')

    console.log(`Local: http://localhost:${mergeConfig?.app?.port}`)
    console.log(`Network: http://${ip.address()}:${mergeConfig?.app?.port}`)
}