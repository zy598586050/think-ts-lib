/*
 * @Author: zhangyu
 * @Date: 2023-11-13 19:47:22
 * @LastEditTime: 2023-11-14 12:15:08
 */
import log4js from 'log4js'
import { getConfig } from './config'

const levels: any = {
    'trace': log4js.levels.TRACE,
    'debug': log4js.levels.DEBUG,
    'info': log4js.levels.INFO,
    'warn': log4js.levels.WARN,
    'error': log4js.levels.ERROR,
    'fatal': log4js.levels.FATAL,
}

type LEVELS = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

log4js.configure({
    appenders: {
        console: {
            type: 'console'
        },
        info: {
            type: 'file',
            filename: getConfig().app.log_info_filename
        },
        error: {
            type: 'dateFile',
            filename: getConfig().app.log_error_filename,
            pattern: getConfig().app.log_error_pattern,
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
})

// 日志输出
export default (str: string, level: LEVELS = 'debug') => {
    const logger = log4js.getLogger(level)
    logger.level = levels[level]
    logger[level](str)
}