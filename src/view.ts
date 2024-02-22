/*
 * @Author: zhangyu
 * @Date: 2023-10-28 16:59:04
 * @LastEditTime: 2023-12-28 17:55:02
 */
import fs from 'fs'
import path from 'path'
import { renderToString as renderVueToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import { getConfig } from './config'
import { Utils } from './utils'
import { createServer } from 'vite'
import { parse, compileStyle } from '@vue/compiler-sfc'
import { renderToString as renderReactToString } from 'react-dom/server'

let viteInstance: any

/**
 * .vue 文件转 html
 * @param url .vue文件路径
 * @param data 数据
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
    const appContent = await renderVueToString(app, ctx)
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

/**
 * .jsx 文件转 html
 * @param url .jsx文件路径
 * @param data 数据
 * @returns 
 */
export const reactRenderToString = async (url: string, data: Object) => {
    // 单例开启一个服务
    if (!viteInstance) {
        viteInstance = await createServer({
            server: { middlewareMode: true },
            appType: 'custom'
        })
    }
    // 加载react文件
    const htmlPath = path.resolve(process.cwd(), `${getConfig().app.static_path}/index.html`)
    let html = fs.readFileSync(htmlPath, 'utf-8')
    url = url.startsWith('/') ? url : `/${url}`
    const reactPath = path.resolve(process.cwd(), `${getConfig().app.view_path}${url}${url.endsWith('.jsx') ? '' : '.jsx'}`)
    const { default: App } = await viteInstance.ssrLoadModule(reactPath)
    const appContent = renderReactToString(App)
    html = html.replace(`<!--ssr-outlet-->`, appContent)
    html = html.replace(`<!--ssr-outlet-->`, `<h2>待完善...</h2>`)
    return html
}

/**
 * layui的html文件
 * @param url .html文件路径
 * @param data 数据
 * @returns 
 */
export const layuiRenderToString = async (url: string, data: Object) => {
    const htmlPath = path.resolve(process.cwd(), `${getConfig().app.static_path}/index.html`)
    let html = fs.readFileSync(htmlPath, 'utf-8')
    url = url.startsWith('/') ? url : `/${url}`
    const layuiPath = path.resolve(process.cwd(), `${getConfig().app.view_path}${url}${url.endsWith('.html') ? '' : '.html'}`)
    let layuiHtml = fs.readFileSync(layuiPath, 'utf-8')
    // 绑定结构
    const regDiv = /<template\b[^>]*>([\s\S]*?)<\/template>/i
    html = html.replace(`<!--ssr-outlet-->`, regDiv.exec(layuiHtml)?.[1] || '')
    // 绑定样式
    const regStyle = /<style\b[^>]*>([\s\S]*?)<\/style>/i
    html = html.replace(`<!--ssr-style-->`, `<link href="//unpkg.com/layui@2.9.6/dist/css/layui.css" rel="stylesheet"><style>${regStyle.exec(layuiHtml)?.[1] || ''}</style>`)
    // 绑定脚本
    html = html.replace(`<!--ssr-script-->`, `<script src="//unpkg.com/layui@2.9.6/dist/layui.js"></script>`)
    // 绑定数据
    layuiHtml = layuiHtml.replace(`<!--ssr-data-->`, JSON.stringify(data))
    // 绑定layui脚本
    const regScript = /<script\b(?![^>]*type="text\/html")[^>]*>([\s\S]*?)<\/script>/i
    html = html.replace(`<!--ssr-layui-script-->`, `<script>${regScript.exec(layuiHtml)?.[1] || ''}</script>`)
    return html
}