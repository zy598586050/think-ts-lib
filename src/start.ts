/*
 * @Author: zhangyu
 * @Date: 2023-10-17 15:43:32
 * @LastEditTime: 2023-10-18 11:41:28
 */

import Koa from 'koa'
import KoaBody from 'koa-body'
import figlet from 'figlet'
import ip from 'ip'
import { setConfig, getConfig } from './config'
import errorHandler from './error'
import router from './router'

const app = new Koa()

export default (cfg: Record<string, any> = {}) => {
    // 打印ThinkTS
    const result = figlet.textSync('ThinkTS')
    console.log(result)

    console.time('用时')
    const mergeConfig = setConfig(getConfig(cfg?.app?.configPath), cfg)
    app
        .use(errorHandler)
        .use(KoaBody(mergeConfig?.app?.koaBody))
        .use(router.routes())
        .use(router.allowedMethods())
        .listen(mergeConfig?.app?.port)
    console.timeEnd('用时')

    console.log(`Local: http://localhost:${mergeConfig?.app?.port}`)
    console.log(`Network: http://${ip.address()}:${mergeConfig?.app?.port}`)
}