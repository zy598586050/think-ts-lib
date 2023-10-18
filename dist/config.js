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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConfig = exports.getConfig = void 0;
/*
 * @Author: zhangyu
 * @Date: 2023-10-17 16:10:03
 * @LastEditTime: 2023-10-18 10:32:22
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const lodash_1 = require("lodash");
let appConfig = {};
const defaultConfigPath = 'config'; // 配置目录, 默认会读取./config目录下的所有配置文件
// 读取配置属性
const getConfig = (configPath) => {
    // 配置目录, 默认会读取./config目录下的所有配置文件
    const configDir = path.resolve(process.cwd(), configPath ?? defaultConfigPath);
    // 只有存在该目录才会去合并
    if (fs.existsSync(configDir) && fs.statSync(configDir).isDirectory()) {
        fs.readdirSync(configDir).forEach((file) => {
            // 必须为ts文件并且导出了内容
            if (file.endsWith('.ts')) {
                const modulePath = path.join(configDir, file);
                const moduleContent = require(modulePath);
                if (moduleContent && moduleContent.default) {
                    appConfig[file.replace('.ts', '')] = moduleContent.default;
                }
            }
        });
    }
    return (0, lodash_1.merge)({
        app: {
            port: 5985,
            configPath: defaultConfigPath,
            koaBody: {
                multipart: true // 支持multipart-formdate表单，可用于文件上传
            },
            enableLog: false,
            log_info_filename: 'logs/all-logs.log',
            log_error_filename: 'logs/log',
            log_error_pattern: 'yyy-MM-dd.log',
            route_path: 'route' // 默认路由文件目录地址
        }
    }, appConfig);
};
exports.getConfig = getConfig;
// 设置配置属性
const setConfig = (oldObj, newObj) => {
    return (0, lodash_1.merge)(oldObj, newObj);
};
exports.setConfig = setConfig;
exports.default = {
    getConfig: exports.getConfig,
    setConfig: exports.setConfig
};
