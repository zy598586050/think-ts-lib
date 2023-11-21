/*
 * @Author: zhangyu
 * @Date: 2023-10-17 15:43:32
 * @LastEditTime: 2023-11-21 11:11:50
 */
import path from 'path'
import Koa from 'koa'
import KoaBody from 'koa-body'
import KoaStatic from 'koa-static'
import websockify from 'koa-websocket'
import figlet from 'figlet'
import ip from 'ip'
import { getConfig, initConfig } from './config'
import errorHandler from './error'
import router from './router'

const app = new Koa()
const websocket = websockify(app)

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

    // websocket
    if (mergeConfig?.ws?.enable) {
        const wsDir = path.resolve(process.cwd(), `${mergeConfig?.ws?.websocket_path}${mergeConfig?.ws?.websocket_path.endsWith('.ts') ? '' : '.ts'}`)
        try {
            const module = await import(wsDir)
            websocket.ws.use(module.default)
        } catch (error) {
            console.log(error)
        }
        websocket.listen(mergeConfig?.ws?.port)
        console.log(`WebSocket: ws://${ip.address()}:${mergeConfig?.ws?.port}`)
    }
}