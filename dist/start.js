"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: zhangyu
 * @Date: 2023-10-17 15:43:32
 * @LastEditTime: 2023-11-15 21:19:05
 */
const path_1 = __importDefault(require("path"));
const koa_1 = __importDefault(require("koa"));
const koa_body_1 = __importDefault(require("koa-body"));
const koa_static_1 = __importDefault(require("koa-static"));
const figlet_1 = __importDefault(require("figlet"));
const ip_1 = __importDefault(require("ip"));
const config_1 = require("./config");
const error_1 = __importDefault(require("./error"));
const router_1 = __importDefault(require("./router"));
const app = new koa_1.default();
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
};
