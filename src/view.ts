/*
 * @Author: zhangyu
 * @Date: 2023-10-28 16:59:04
 * @LastEditTime: 2023-12-27 20:15:29
 */
import fs from 'fs'
import path from 'path'
import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { getConfig } from './config'
import { Utils } from './utils'
import { createServer } from 'vite'
import { parse, compileStyle } from '@vue/compiler-sfc'

let viteInstance: any

/**
 * .vue 文件转 html
 * @param url .vue文件路径
 * @returns 
 */
export const vueRenderToString = async (url: string, data: Object) => {
    // 单例开启一个服务
    if (!viteInstance) {
        viteInstance = await createServer({
            server: { middlewareMode: true },
            appType: 'custom'
        })
    }
    // 加载vue文件
    const htmlPath = path.resolve(process.cwd(), `${getConfig().app.static_path}/index.html`)
    let html = fs.readFileSync(htmlPath, 'utf-8')
    url = url.startsWith('/') ? url : `/${url}`
    const vuePath = path.resolve(process.cwd(), `${getConfig().app.view_path}${url}${url.endsWith('.vue') ? '' : '.vue'}`)
    const { default: App } = await viteInstance.ssrLoadModule(vuePath)
    const app = createSSRApp(App, { ssrData: data })
    const ctx: any = {}
    const appContent = await renderToString(app, ctx)
    let style = '' // 样式收集
    // 解析vue
    const module = new Set(ctx.modules)
    module.forEach((vueUrl) => {
        vueUrl = path.resolve(process.cwd(), vueUrl as string)
        const vueFile = fs.readFileSync(vueUrl as string, 'utf-8')
        const { descriptor } = parse(vueFile, { filename: vueUrl as string })
        const { styles } = descriptor
        // 为了方便修改scoped的标识符，采用这种方式渲染css, 如果解决了标识符不一致的问题，可不用这种方式渲染
        const id = `data-v-${Utils.sha1(descriptor.filename)}`
        styles.forEach((styleItem) => {
            const compiledStyle = compileStyle({
                filename: descriptor.filename,
                source: styleItem.content,
                id,
                scoped: styleItem.scoped,
                preprocessLang: styleItem.lang as 'scss' || 'scss',
                preprocessOptions: {
                    outputStyle: 'compressed'
                }
            })
            style += compiledStyle.code
        })
    })
    // 绑定结构
    html = html.replace(`<!--ssr-outlet-->`, appContent)
    // 绑定样式
    html = html.replace(`<!--ssr-style-->`, `<style>${style}</style>`)
    // html = html.replace(`<!--ssr-style-->`, `<link rel="stylesheet" crossorigin href="./css${url.replace('.vue', '')}.css">`)
    // 绑定同构代码
    html = html.replace(`<!--ssr-script-->`, `<script type="module" crossorigin src="./js${url.replace('.vue', '')}.js"></script>`)
    return html
}