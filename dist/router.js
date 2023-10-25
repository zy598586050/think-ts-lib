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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("./config");
const exception_1 = require("./exception");
const errorcode_1 = require("./errorcode");
const config = (0, config_1.getConfig)();
const router = new koa_router_1.default();
const urlArray = [];
const route = {
    // GET路由
    get(url, str, middleware) {
        // 检测路由是否重复
        hasRepeatRoute(url);
        // 检测控制器方法是否存在, 存在就返回该方法
        const fn = hasControllerFun(str);
        router.get(url, async (ctx) => {
            // 动态执行控制器的方法
            const { body, status } = await (await fn)(ctx);
            ctx.body = body;
            ctx.status = status;
        });
    }
};
// 检测控制器方法是否存在
const hasControllerFun = async (str) => {
    let fn = null;
    if (!str.includes('/')) {
        throw new exception_1.HttpException({
            msg: `路由控制器方法配置有误[${str}]`,
            errorCode: errorcode_1.ErrorCode.ERROR_ROUTE,
            statusCode: 500
        });
    }
    const strArray = str.split('/');
    const beforePath = strArray.slice(0, -1).join('/');
    const importUrl = path.resolve(process.cwd(), `${config.app.controller_path}/${beforePath}.ts`);
    try {
        const module = await Promise.resolve(`${importUrl}`).then(s => __importStar(require(s)));
        const controller = new module.default();
        if (typeof controller[strArray[strArray.length - 1]] === 'function') {
            fn = controller[strArray[strArray.length - 1]];
        }
        else {
            throw new exception_1.HttpException({
                msg: `路由控制器方法配置有误[${str}]`,
                errorCode: errorcode_1.ErrorCode.ERROR_ROUTE,
                statusCode: 500
            });
        }
    }
    catch (error) {
        console.log(error);
        throw new exception_1.HttpException({
            msg: `路由控制器方法配置有误[${str}]`,
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
const routeDir = path.resolve(process.cwd(), config.app.route_path);
const loadRoute = (routeDir) => {
    // 只有存在该目录才会去合并
    if (fs.existsSync(routeDir) && fs.statSync(routeDir).isDirectory()) {
        fs.readdirSync(routeDir).forEach((file) => {
            const modulePath = path.join(routeDir, file);
            if (fs.statSync(modulePath).isDirectory()) {
                loadRoute(modulePath);
            }
            else if (file.endsWith('.ts')) {
                Promise.resolve(`${modulePath}`).then(s => __importStar(require(s))).then((module) => {
                    if (module && module.default) {
                        module.default(route);
                    }
                }).catch(() => {
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
