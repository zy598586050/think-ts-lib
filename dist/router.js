"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_router_1 = __importDefault(require("koa-router"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const exception_1 = require("./exception");
const errorcode_1 = require("./errorcode");
const config = (0, config_1.getConfig)();
const router = new koa_router_1.default();
const urlArray = [];
// 具体执行的方法
const handleRoute = (method, url, str, middleware) => {
    url = url.startsWith('/') ? url : `/${url}`;
    // 检测路由是否重复
    hasRepeatRoute(url);
    // 检测控制器方法是否存在, 存在就返回该方法
    const fn = hasControllerFun(str);
    router[method](url, async (ctx) => {
        // 挂载控制器路径
        ctx.beforePath = str.split('/').slice(0, -1).join('/');
        ctx.fnName = (await (await fn)).name;
        // 动态执行控制器的方法
        const { body, status } = await (await fn)(ctx);
        // 判断是否有中间件
        if (typeof middleware === 'function') {
            await middleware(ctx, () => {
                ctx.body = body;
                ctx.status = status;
            }, (msg = '请求错误', errorCode = 30000, statusCode = 400) => {
                throw new exception_1.HttpException({
                    msg,
                    errorCode,
                    statusCode
                });
            });
        }
        else {
            ctx.body = body;
            ctx.status = status;
        }
    });
};
// 路由
const route = {
    // GET 路由
    get(url, str, middleware) {
        handleRoute('get', url, str, middleware);
    },
    // POST 路由
    post(url, str, middleware) {
        handleRoute('post', url, str, middleware);
    },
    // PUT 路由
    put(url, str, middleware) {
        handleRoute('put', url, str, middleware);
    },
    // DELETE 路由
    delete(url, str, middleware) {
        handleRoute('delete', url, str, middleware);
    },
    // 分组路由
    group(prefix, callback, middleware) {
        callback({
            // GET 路由
            get: (url, str) => {
                url = url.startsWith('/') ? url : `/${url}`;
                this.get(`${prefix}${url}`, str, middleware);
            },
            // POST 路由
            post: (url, str) => {
                url = url.startsWith('/') ? url : `/${url}`;
                this.post(`${prefix}${url}`, str, middleware);
            },
            // PUT 路由
            put: (url, str) => {
                url = url.startsWith('/') ? url : `/${url}`;
                this.put(`${prefix}${url}`, str, middleware);
            },
            // DELETE 路由
            delete: (url, str) => {
                url = url.startsWith('/') ? url : `/${url}`;
                this.delete(`${prefix}${url}`, str, middleware);
            }
            // 规定不支持递归分组
        });
    }
};
// 检测控制器方法是否存在
const hasControllerFun = async (str) => {
    let fn = null;
    if (!str.includes('/')) {
        throw new exception_1.HttpException({
            msg: `路由控制器方法有误[${str}]`,
            errorCode: errorcode_1.ErrorCode.ERROR_ROUTE,
            statusCode: 500
        });
    }
    const strArray = str.split('/');
    const beforePath = strArray.slice(0, -1).join('/');
    const importUrl = path_1.default.resolve(process.cwd(), `${config.app.controller_path}/${beforePath}.ts`);
    try {
        const module = await Promise.resolve(`${importUrl}`).then(s => __importStar(require(s)));
        const controller = new module.default();
        if (typeof controller[strArray[strArray.length - 1]] === 'function') {
            fn = controller[strArray[strArray.length - 1]];
        }
        else {
            throw new exception_1.HttpException({
                msg: `路由控制器方法有误[${str}]`,
                errorCode: errorcode_1.ErrorCode.ERROR_ROUTE,
                statusCode: 500
            });
        }
    }
    catch (error) {
        console.log(error);
        throw new exception_1.HttpException({
            msg: `路由控制器方法有误[${str}]`,
            errorCode: errorcode_1.ErrorCode.ERROR_ROUTE,
            statusCode: 500
        });
    }
    return fn;
};
// 判断路由是否重复
const hasRepeatRoute = (url) => {
    if (urlArray.includes(url)) {
        throw new exception_1.HttpException({
            msg: `路由重复[${url}]`,
            errorCode: errorcode_1.ErrorCode.ERROR_ROUTE,
            statusCode: 500
        });
    }
    else {
        urlArray.push(url);
    }
};
// 加载路由配置
const routeDir = path_1.default.resolve(process.cwd(), config.app.route_path);
const loadRoute = (routeDir) => {
    // 只有存在该目录才会去合并
    if (fs_1.default.existsSync(routeDir) && fs_1.default.statSync(routeDir).isDirectory()) {
        fs_1.default.readdirSync(routeDir).forEach((file) => {
            const modulePath = path_1.default.join(routeDir, file);
            if (fs_1.default.statSync(modulePath).isDirectory()) {
                loadRoute(modulePath);
            }
            else if (file.endsWith('.ts')) {
                Promise.resolve(`${modulePath}`).then(s => __importStar(require(s))).then((module) => {
                    if (module && module.default) {
                        module.default(route);
                    }
                }).catch((error) => {
                    console.log(error);
                    throw new exception_1.HttpException({
                        msg: '路由加载错误',
                        errorCode: errorcode_1.ErrorCode.ERROR_ROUTE,
                        statusCode: 500
                    });
                });
            }
        });
    }
};
loadRoute(routeDir);
exports.default = router;
