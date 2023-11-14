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
exports.getConfig = exports.initConfig = void 0;
/*
 * @Author: zhangyu
 * @Date: 2023-10-17 16:10:03
 * @LastEditTime: 2023-11-14 18:26:17
 */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const lodash_1 = require("lodash");
const exception_1 = require("./exception");
const errorcode_1 = require("./errorcode");
const defaultConfigPath = 'config'; // 配置目录, 默认会读取./config目录下的所有配置文件
let appConfig = {}; // 加载的配置文件里的配置
// 加载配置
const loadConfig = async (configDir) => {
    // 只有存在该目录才会去合并
    if (fs_1.default.existsSync(configDir) && fs_1.default.statSync(configDir).isDirectory()) {
        for (const file of fs_1.default.readdirSync(configDir)) {
            const modulePath = path_1.default.join(configDir, file);
            if (fs_1.default.statSync(modulePath).isDirectory()) {
                await loadConfig(modulePath);
            }
            else if (file.endsWith('.ts')) {
                try {
                    const module = await Promise.resolve(`${modulePath}`).then(s => __importStar(require(s)));
                    if (module && module.default) {
                        appConfig = (0, lodash_1.merge)(module.default);
                    }
                }
                catch (error) {
                    console.log(error);
                    throw new exception_1.HttpException({
                        msg: '配置加载错误',
                        errorCode: errorcode_1.ErrorCode.ERROR_ROUTE,
                        statusCode: 500
                    });
                }
            }
        }
    }
};
// 初始化配置文件
const initConfig = async (configPath) => {
    // 配置目录, 默认会读取./config目录下的所有配置文件
    const configDir = path_1.default.resolve(process.cwd(), configPath ?? defaultConfigPath);
    await loadConfig(configDir);
};
exports.initConfig = initConfig;
// 读取配置属性
const getConfig = (cfg = {}) => {
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
            route_path: 'route',
            controller_path: 'controller',
            middleware_path: 'middleware',
            view_path: 'views',
            static_path: 'public',
            validate_path: 'validate',
            utils_path: 'utils',
            model_path: 'service',
            jwt_key: 'ThinkTS',
            expiresIn: 60 * 60, // JWT过期时间
        }
    }, appConfig, cfg);
};
exports.getConfig = getConfig;
