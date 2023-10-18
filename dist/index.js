"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
/*
 * @Author: zhangyu
 * @Date: 2023-10-17 10:20:31
 * @LastEditTime: 2023-10-18 11:29:29
 */
const start_1 = __importDefault(require("./start"));
const config_1 = require("./config");
exports.appConfig = (0, config_1.getConfig)();
exports.default = {
    start: start_1.default,
    appConfig: (0, config_1.getConfig)()
};
