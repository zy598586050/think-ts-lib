"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactRenderToString = exports.vueRenderToString = void 0;
/*
 * @Author: zhangyu
 * @Date: 2023-10-28 16:59:04
 * @LastEditTime: 2023-12-28 17:55:02
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const server_renderer_1 = require("@vue/server-renderer");
const vue_1 = require("vue");
const config_1 = require("./config");
const utils_1 = require("./utils");
const vite_1 = require("vite");
const compiler_sfc_1 = require("@vue/compiler-sfc");
const server_1 = require("react-dom/server");
let viteInstance;
/**
 * .vue 文件转 html
 * @param url .vue文件路径
 * @returns
 */
const vueRenderToString = async (url, data) => {
    // 单例开启一个服务
    if (!viteInstance) {
        viteInstance = await (0, vite_1.createServer)({
            server: { middlewareMode: true },
            appType: 'custom'
        });
    }
    // 加载vue文件
    const htmlPath = path_1.default.resolve(process.cwd(), `${(0, config_1.getConfig)().app.static_path}/index.html`);
    let html = fs_1.default.readFileSync(htmlPath, 'utf-8');
    url = url.startsWith('/') ? url : `/${url}`;
    const vuePath = path_1.default.resolve(process.cwd(), `${(0, config_1.getConfig)().app.view_path}${url}${url.endsWith('.vue') ? '' : '.vue'}`);
    const { default: App } = await viteInstance.ssrLoadModule(vuePath);
    const app = (0, vue_1.createSSRApp)(App, { ssrData: data });
    const ctx = {};
    const appContent = await (0, server_renderer_1.renderToString)(app, ctx);
    let style = ''; // 样式收集
    // 解析vue
    const module = new Set(ctx.modules);
    module.forEach((vueUrl) => {
        vueUrl = path_1.default.resolve(process.cwd(), vueUrl);
        const vueFile = fs_1.default.readFileSync(vueUrl, 'utf-8');
        const { descriptor } = (0, compiler_sfc_1.parse)(vueFile, { filename: vueUrl });
        const { styles } = descriptor;
        // 为了方便修改scoped的标识符，采用这种方式渲染css, 如果解决了标识符不一致的问题，可不用这种方式渲染
        const id = `data-v-${utils_1.Utils.sha1(descriptor.filename)}`;
        styles.forEach((styleItem) => {
            const compiledStyle = (0, compiler_sfc_1.compileStyle)({
                filename: descriptor.filename,
                source: styleItem.content,
                id,
                scoped: styleItem.scoped,
                preprocessLang: styleItem.lang || 'scss',
                preprocessOptions: {
                    outputStyle: 'compressed'
                }
            });
            style += compiledStyle.code;
        });
    });
    // 绑定结构
    html = html.replace(`<!--ssr-outlet-->`, appContent);
    // 绑定样式
    html = html.replace(`<!--ssr-style-->`, `<style>${style}</style>`);
    // html = html.replace(`<!--ssr-style-->`, `<link rel="stylesheet" crossorigin href="./css${url.replace('.vue', '')}.css">`)
    // 绑定同构代码
    html = html.replace(`<!--ssr-script-->`, `<script type="module" crossorigin src="./js${url.replace('.vue', '')}.js"></script>`);
    return html;
};
exports.vueRenderToString = vueRenderToString;
/**
 * .jsx 文件转 html
 * @param url .jsx文件路径
 * @returns
 */
const reactRenderToString = async (url, data) => {
    // 单例开启一个服务
    if (!viteInstance) {
        viteInstance = await (0, vite_1.createServer)({
            server: { middlewareMode: true },
            appType: 'custom'
        });
    }
    // 加载react文件
    const htmlPath = path_1.default.resolve(process.cwd(), `${(0, config_1.getConfig)().app.static_path}/index.html`);
    let html = fs_1.default.readFileSync(htmlPath, 'utf-8');
    url = url.startsWith('/') ? url : `/${url}`;
    const reactPath = path_1.default.resolve(process.cwd(), `${(0, config_1.getConfig)().app.view_path}${url}${url.endsWith('.jsx') ? '' : '.jsx'}`);
    const { default: App } = await viteInstance.ssrLoadModule(reactPath);
    const appContent = (0, server_1.renderToString)(App);
    html = html.replace(`<!--ssr-outlet-->`, appContent);
    html = html.replace(`<!--ssr-outlet-->`, `<h2>待完善...</h2>`);
    return html;
};
exports.reactRenderToString = reactRenderToString;
