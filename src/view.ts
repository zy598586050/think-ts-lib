/*
 * @Author: zhangyu
 * @Date: 2023-10-28 16:59:04
 * @LastEditTime: 2023-11-14 12:16:32
 */
import { createSSRApp } from 'vue'
import { parse } from '@vue/compiler-sfc'
import { HttpException } from './exception'
import { getConfig } from './config'
import { ErrorCode } from './errorcode'
import { merge } from 'lodash'
import fs from 'fs'
import path from 'path'
import util from 'util'


interface VUETYPE {
    data?: any
    methods?: any
}

/**
 * 同构实例
 * @param data 根组件数据
 * @param template 模板字符串
 * @param obj 对象
 * @returns 
 */
export const createApp = (data: Object, template: string, obj: VUETYPE) => {
    return createSSRApp({
        ...obj,
        data() {
            return merge(data, obj?.data() || {})
        },
        template
    })
}

/**
 * 最终渲染的html
 * @param style 样式
 * @param ssr vue服务端渲染
 * @returns 
 */
export const htmlView = (style: string, ssr: string, data: Object, template: string, obj: VUETYPE) => {
    let html = ''
    try {
        const htmlPath = path.resolve(process.cwd(), `${getConfig().app.static_path}/index.html`)
        html = fs.readFileSync(htmlPath, 'utf-8')
        // 插入样式
        const regStyle = /(<head>)([\s\S]*?)(<\/head>)/i
        html = html.replace(regStyle, `$1$2<style>${style}</style>$3`)
        // 插入vue服务端渲染代码
        const regSSR = /(<div id="app">)([\s\S]*?)(<\/div>)/i
        html = html.replace(regSSR, `$1$2${ssr}$3`)
        // 插入同构代码
        const regScript = /(<body>)([\s\S]*?)(<\/body>)/i
        const vueObj = {
            ...obj,
            data() {
                return merge(data, obj?.data() || {})
            },
            template
        }
        const scriptStr = `
        <script type="module">
        import { createSSRApp } from 'vue'
        createSSRApp(${vueObjToString(vueObj)}).mount('#app')
        </script>
        `
        html = html.replace(regScript, `$1$2${scriptStr}$3`)
    } catch (error) {
        console.log(error)
        throw new HttpException({
            msg: '视图模板index.html文件解析错误',
            errorCode: ErrorCode.ERROR_VIEW,
            statusCode: 404
        })
    }
    return html
}

// vue对象转字符串代码
const vueObjToString = (vueObj: any) => {
    const stringifyData = (data: Object) => {
        return data ? `data() { return ${util.inspect(data)} },` : ''
    }
    const stringifyTemplate = (str: string) => {
        return `template: \`${str}\`,`
    }
    const stringifyComponents = (components: any): string => {
        return components ? `components: {${Object.keys(components).map(key => `${key}: ${vueObjToString(components[key])}`).join(',')}},` : ''
    }
    const stringifyFunction = (obj: any) => {
        return Object.keys(obj).filter(key => typeof obj[key] === 'function').map(key => obj[key].toString()).join(',')
    }
    const stringifyMethods = (methods: any) => {
        return methods ? `methods: {${stringifyFunction(methods)}},` : ''
    }
    const stringifyWatch = (watch: any) => {
        return watch ? `watch: {${stringifyFunction(watch)}},` : ''
    }
    const stringifyComputed = (computed: any) => {
        return computed ? `computed: {${stringifyFunction(computed)}},` : ''
    }
    const stringifyProps = (props: any) => {
        return props ? `props: ${util.inspect(vueObj.props || {})}` : ''
    }
    return `{
        ${stringifyData(vueObj.data())}
        ${stringifyTemplate(vueObj.template)}
        ${stringifyComponents(vueObj?.components)}
        ${stringifyMethods(vueObj?.methods)}
        ${stringifyWatch(vueObj?.watch)}
        ${stringifyComputed(vueObj?.computed)}
        ${stringifyProps(vueObj?.props)}
    }`
}

/**
 * 解析.vue文件
 * @param url 
 * @returns 
 */
export const importVue = (url: string) => {
    let vueCode = ''
    let template = ''
    let style = ''
    let vueObj: any = {}
    try {
        const viewPath = path.resolve(process.cwd(), `${getConfig().app.view_path}/${url}${url.endsWith('.vue') ? '' : '.vue'}`)
        vueCode = fs.readFileSync(viewPath, 'utf-8')
    } catch (error) {
        console.log(error)
        throw new HttpException({
            msg: '找不到视图文件',
            errorCode: ErrorCode.ERROR_VIEW,
            statusCode: 404
        })
    }
    try {
        const { descriptor } = parse(vueCode)
        template = descriptor?.template?.content || ''
        style = descriptor.styles.map(v => v.content).join()
        const codeString = descriptor?.script?.content || ''
        const objStr = codeString.split('export default')
        if (objStr?.[1]) {
            const code = `(${objStr?.[1]?.replace(/\r\n/g, '') || ''})`
            vueObj = new Function(`return ${code}`)() || {}
            if (vueObj?.components) {
                Object.keys(vueObj?.components).forEach(key => {
                    const iv = importVue(vueObj?.components?.[key])
                    vueObj.components[key] = {
                        template: iv.template,
                        ...iv.vueObj
                    }
                })
            }
        }
    } catch (error) {
        console.log(error)
        throw new HttpException({
            msg: '视图文件解析错误',
            errorCode: ErrorCode.ERROR_VIEW,
            statusCode: 404
        })
    }
    return {
        template,
        style,
        vueObj
    }
}