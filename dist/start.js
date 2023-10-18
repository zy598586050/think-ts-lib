"use strict";
/*
 * @Author: zhangyu
 * @Date: 2023-10-17 15:43:32
 * @LastEditTime: 2023-10-18 11:41:28
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const koa_body_1 = __importDefault(require("koa-body"));
const figlet_1 = __importDefault(require("figlet"));
const ip_1 = __importDefault(require("ip"));
const config_1 = require("./config");
const error_1 = __importDefault(require("./error"));
const router_1 = __importDefault(require("./router"));
const app = new koa_1.default();
exports.default = (cfg = {}) => {
    // 打印ThinkTS
    const result = figlet_1.default.textSync('ThinkTS');
    console.log(result);
    console.time('用时');
    const mergeConfig = (0, config_1.setConfig)((0, config_1.getConfig)(cfg?.app?.configPath), cfg);
    app
        .use(error_1.default)
        .use((0, koa_body_1.default)(mergeConfig?.app?.koaBody))
        .use(router_1.default.routes())
        .use(router_1.default.allowedMethods())
        .listen(mergeConfig?.app?.port);
    console.timeEnd('用时');
    console.log(`Local: http://localhost:${mergeConfig?.app?.port}`);
    console.log(`Network: http://${ip_1.default.address()}:${mergeConfig?.app?.port}`);
};
