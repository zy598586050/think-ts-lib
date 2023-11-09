/*
 * @Author: zhangyu
 * @Date: 2023-10-17 16:10:03
 * @LastEditTime: 2023-11-07 21:08:28
 */
import fs from 'fs'
import path from 'path'
import { merge } from 'lodash'
import { HttpException } from './exception'
import { ErrorCode } from './errorcode'

let appConfig: Record<string, any> = {}
const defaultConfigPath = 'config' // 配置目录, 默认会读取./config目录下的所有配置文件

// 加载配置
const loadConfig = (configDir: string) => {
    // 只有存在该目录才会去合并
    if (fs.existsSync(configDir) && fs.statSync(configDir).isDirectory()) {
        fs.readdirSync(configDir).forEach((file) => {
            const modulePath = path.join(configDir, file)
            if (fs.statSync(modulePath).isDirectory()) {
                loadConfig(modulePath)
            } else if (file.endsWith('.ts')) {
                import(modulePath).then((module) => {
                    if (module && module.default) {
                        appConfig[file.replace('.ts', '')] = module.default
                    }
                }).catch(() => {
                    throw new HttpException({
                        msg: '配置加载错误',
                        errorCode: ErrorCode.ERROR_ROUTE,
                        statusCode: 500
                    })
                })
            }
        })
    }
}

// 读取配置属性
export const getConfig = (configPath?: string) => {
    // 配置目录, 默认会读取./config目录下的所有配置文件
    const configDir = path.resolve(process.cwd(), configPath ?? defaultConfigPath)
    loadConfig(configDir)
    return merge({
        app: {
            port: 5985, // 项目启动端口
            configPath: defaultConfigPath, // 配置目录, 默认会读取./config目录下的所有配置文件
            koaBody: {
                multipart: true // 支持multipart-formdate表单，可用于文件上传
            },
            enableLog: false, // 是否开启日志
            log_info_filename: 'logs/all-logs.log',
            log_error_filename: 'logs/log',
            log_error_pattern: 'yyy-MM-dd.log',
            route_path: 'route', // 默认路由文件目录地址
            controller_path: 'controller', // 默认控制器文件目录地址
            middleware_path: 'middleware', // 默认中间件文件目录地址
            view_path: 'views', // 默认视图目录地址
            static_path: 'public', // 静态资源目录
        }
    }, appConfig)
}

// 设置配置属性
export const setConfig = (oldObj: Record<string, any>, newObj: Record<string, any>) => {
    return merge(oldObj, newObj)
}

export default {
    getConfig,
    setConfig
}