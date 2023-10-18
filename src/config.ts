/*
 * @Author: zhangyu
 * @Date: 2023-10-17 16:10:03
 * @LastEditTime: 2023-10-18 12:10:22
 */
import * as fs from 'fs'
import * as path from 'path'
import { merge } from 'lodash'

let appConfig: Record<string, any> = {}
const defaultConfigPath = 'config' // 配置目录, 默认会读取./config目录下的所有配置文件

// 读取配置属性
export const getConfig = (configPath?: string) => {
    // 配置目录, 默认会读取./config目录下的所有配置文件
    const configDir = path.resolve(process.cwd(), configPath ?? defaultConfigPath)
    // 只有存在该目录才会去合并
    if (fs.existsSync(configDir) && fs.statSync(configDir).isDirectory()) {
        fs.readdirSync(configDir).forEach((file) => {
            // 必须为ts文件并且导出了内容
            if (file.endsWith('.ts')) {
                const modulePath = path.join(configDir, file)
                const moduleContent = require(modulePath)
                if (moduleContent && moduleContent.default) {
                    appConfig[file.replace('.ts', '')] = moduleContent.default
                }
            }
        })
    }
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