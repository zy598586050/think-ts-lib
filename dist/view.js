"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importVue = exports.htmlView = exports.createApp = void 0;
/*
 * @Author: zhangyu
 * @Date: 2023-10-28 16:59:04
 * @LastEditTime: 2023-11-09 18:23:28
 */
const vue_1 = require("vue");
const compiler_sfc_1 = require("@vue/compiler-sfc");
const exception_1 = require("./exception");
const config_1 = require("./config");
const errorcode_1 = require("./errorcode");
const lodash_1 = require("lodash");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const config = (0, config_1.getConfig)();
/**
 * 同构实例
 * @param data 根组件数据
 * @param template 模板字符串
 * @param obj 对象
 * @returns
 */
const createApp = (data, template, obj) => {
    return (0, vue_1.createSSRApp)({
        ...obj,
        data() {
            return (0, lodash_1.merge)(data, obj?.data() || {});
        },
        template
    });
};
exports.createApp = createApp;
/**
 * 最终渲染的html
 * @param style 样式
 * @param ssr vue服务端渲染
 * @returns
 */
const htmlView = (style, ssr, data, template, obj) => {
    let html = '';
    try {
        const htmlPath = path_1.default.resolve(process.cwd(), `${config.app.static_path}/index.html`);
        html = fs_1.default.readFileSync(htmlPath, 'utf-8');
        // 插入样式
        const regStyle = /(<head>)([\s\S]*?)(<\/head>)/i;
        html = html.replace(regStyle, `$1$2<style>${style}</style>$3`);
        // 插入vue服务端渲染代码
        const regSSR = /(<div id="app">)([\s\S]*?)(<\/div>)/i;
        html = html.replace(regSSR, `$1$2${ssr}$3`);
        // 插入同构代码
        const regScript = /(<body>)([\s\S]*?)(<\/body>)/i;
        const vueObj = {
            ...obj,
            data() {
                return (0, lodash_1.merge)(data, obj?.data() || {});
            },
            template
        };
        const scriptStr = `
        <script type="module">
        import { createSSRApp } from 'vue'
        createSSRApp(${vueObjToString(vueObj)}).mount('#app')
        </script>
        `;
        html = html.replace(regScript, `$1$2${scriptStr}$3`);
    }
    catch (error) {
        console.log(error);
        throw new exception_1.HttpException({
            msg: '视图模板index.html文件解析错误',
            errorCode: errorcode_1.ErrorCode.ERROR_VIEW,
            statusCode: 404
        });
    }
    return html;
};
exports.htmlView = htmlView;
// vue对象转字符串代码
const vueObjToString = (vueObj) => {
    const stringifyData = (data) => {
        return data ? `data() { return ${util_1.default.inspect(data)} },` : '';
    };
    const stringifyTemplate = (str) => {
        return `template: \`${str}\`,`;
    };
    const stringifyComponents = (components) => {
        return components ? `components: {${Object.keys(components).map(key => `${key}: ${vueObjToString(components[key])}`).join(',')}},` : '';
    };
    const stringifyFunction = (obj) => {
        return Object.keys(obj).filter(key => typeof obj[key] === 'function').map(key => obj[key].toString()).join(',');
    };
    const stringifyMethods = (methods) => {
        return methods ? `methods: {${stringifyFunction(methods)}},` : '';
    };
    const stringifyWatch = (watch) => {
        return watch ? `watch: {${stringifyFunction(watch)}},` : '';
    };
    const stringifyComputed = (computed) => {
        return computed ? `computed: {${stringifyFunction(computed)}},` : '';
    };
    const stringifyProps = (props) => {
        return props ? `props: ${util_1.default.inspect(vueObj.props || {})}` : '';
    };
    return `{
        ${stringifyData(vueObj.data())}
        ${stringifyTemplate(vueObj.template)}
        ${stringifyComponents(vueObj?.components)}
        ${stringifyMethods(vueObj?.methods)}
        ${stringifyWatch(vueObj?.watch)}
        ${stringifyComputed(vueObj?.computed)}
        ${stringifyProps(vueObj?.props)}
    }`;
};
/**
 * 解析.vue文件
 * @param url
 * @returns
 */
const importVue = (url) => {
    let vueCode = '';
    let template = '';
    let style = '';
    let obj = {};
    try {
        const viewPath = path_1.default.resolve(process.cwd(), `${config.app.view_path}/${url}${url.endsWith('.vue') ? '' : '.vue'}`);
        vueCode = fs_1.default.readFileSync(viewPath, 'utf-8');
    }
    catch (error) {
        console.log(error);
        throw new exception_1.HttpException({
            msg: '找不到视图文件',
            errorCode: errorcode_1.ErrorCode.ERROR_VIEW,
            statusCode: 404
        });
    }
    try {
        const { descriptor } = (0, compiler_sfc_1.parse)(vueCode);
        template = descriptor?.template?.content || '';
        style = descriptor.styles.map(v => v.content).join();
        const code = `(${descriptor?.script?.content?.replace('export default', '')?.replace(/\r\n/g, '') || ''})`;
        obj = new Function(`return ${code}`)() || {};
    }
    catch (error) {
        console.log(error);
        throw new exception_1.HttpException({
            msg: '视图文件解析错误',
            errorCode: errorcode_1.ErrorCode.ERROR_VIEW,
            statusCode: 404
        });
    }
    return {
        template,
        style,
        obj
    };
};
exports.importVue = importVue;
