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
/*
 * @Author: zhangyu
 * @Date: 2023-10-17 15:43:32
 * @LastEditTime: 2023-12-27 11:59:24
 */
const path_1 = __importDefault(require("path"));
const koa_1 = __importDefault(require("koa"));
const koa_body_1 = __importDefault(require("koa-body"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa_websocket_1 = __importDefault(require("koa-websocket"));
const figlet_1 = __importDefault(require("figlet"));
const ip_1 = __importDefault(require("ip"));
const config_1 = require("./config");
const error_1 = __importDefault(require("./error"));
const router_1 = __importDefault(require("./router"));
const app = new koa_1.default();
const websocket = (0, koa_websocket_1.default)(app);
exports.default = async (cfg = {}) => {
    // 打印ThinkTS
    const result = figlet_1.default.textSync('ThinkTS');
    console.log(result);
    console.time('用时');
    await (0, config_1.initConfig)(cfg?.app?.configPath);
    const mergeConfig = (0, config_1.getConfig)(cfg);
    app
        .use(error_1.default)
        .use((0, koa_body_1.default)(mergeConfig?.app?.koaBody))
        .use(router_1.default.routes())
        .use(router_1.default.allowedMethods())
        .use((0, koa_static_1.default)(path_1.default.resolve(process.cwd(), mergeConfig?.app?.static_path)))
        .listen(mergeConfig?.app?.port);
    console.timeEnd('用时');
    console.log(`Local: http://localhost:${mergeConfig?.app?.port}`);
    console.log(`Network: http://${ip_1.default.address()}:${mergeConfig?.app?.port}`);
    // websocket
    if (mergeConfig?.ws?.enable) {
        const wsDir = path_1.default.resolve(process.cwd(), `${mergeConfig?.ws?.websocket_path}${mergeConfig?.ws?.websocket_path.endsWith('.ts') ? '' : '.ts'}`);
        try {
            const module = await Promise.resolve(`${wsDir}`).then(s => __importStar(require(s)));
            websocket.ws.use(module.default);
        }
        catch (error) {
            console.log(error);
        }
        websocket.listen(mergeConfig?.ws?.port);
        console.log(`WebSocket: ws://${ip_1.default.address()}:${mergeConfig?.ws?.port}`);
    }
};
