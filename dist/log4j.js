"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: zhangyu
 * @Date: 2023-11-13 19:47:22
 * @LastEditTime: 2023-12-08 11:31:02
 */
const log4js_1 = __importDefault(require("log4js"));
const config_1 = require("./config");
const levels = {
    'trace': log4js_1.default.levels.TRACE,
    'debug': log4js_1.default.levels.DEBUG,
    'info': log4js_1.default.levels.INFO,
    'warn': log4js_1.default.levels.WARN,
    'error': log4js_1.default.levels.ERROR,
    'fatal': log4js_1.default.levels.FATAL,
};
(0, config_1.getConfig)().app.enableLog && log4js_1.default.configure({
    appenders: {
        console: {
            type: 'console'
        },
        info: {
            type: 'file',
            filename: (0, config_1.getConfig)().app.log_info_filename
        },
        error: {
            type: 'dateFile',
            filename: (0, config_1.getConfig)().app.log_error_filename,
            pattern: (0, config_1.getConfig)().app.log_error_pattern,
            alwaysIncludePattern: true
        }
    },
    categories: {
        default: {
            appenders: ['console'],
            level: 'debug'
        },
        info: {
            appenders: ['info', 'console'],
            level: 'info'
        },
        error: {
            appenders: ['error', 'console'],
            level: 'error'
        }
    }
});
// 日志输出
exports.default = (str, level = 'debug') => {
    const logger = log4js_1.default.getLogger(level);
    logger.level = levels[level];
    logger[level](str);
};
