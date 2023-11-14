/*
 * @Author: zhangyu
 * @Date: 2023-10-17 16:10:03
 * @LastEditTime: 2023-11-14 12:11:25
 */
import fs from 'fs'
import path from 'path'
import { merge } from 'lodash'
import { HttpException } from './exception'
import { ErrorCode } from './errorcode'

const defaultConfigPath = 'config' // 配置目录, 默认会读取./config目录下的所有配置文件
let appConfig: Record<string, any> = {} // 加载的配置文件里的配置

// 加载配置
const loadConfig = async (configDir: string) => {
    // 只有存在该目录才会去合并
    if (fs.existsSync(configDir) && fs.statSync(configDir).isDirectory()) {
        for (const file of fs.readdirSync(configDir)) {
            const modulePath = path.join(configDir, file)
            if (fs.statSync(modulePath).isDirectory()) {
                await loadConfig(modulePath)
            } else if (file.endsWith('.ts')) {
                try {
                    const module = await import(modulePath)
                    if (module && module.default) {
                        appConfig = merge(module.default)
                    }
                } catch (error) {
                    console.log(error)
                    throw new HttpException({
                        msg: '配置加载错误',
                        errorCode: ErrorCode.ERROR_ROUTE,
                        statusCode: 500
                    })
                }
            }
        }
    }
}

// 初始化配置文件
export const initConfig = async (configPath?: string) => {
    // 配置目录, 默认会读取./config目录下的所有配置文件
    const configDir = path.resolve(process.cwd(), configPath ?? defaultConfigPath)
    await loadConfig(configDir)
}

// 读取配置属性
export const getConfig = (cfg: Object = {}) => {
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
            static_path: 'public', // 默认静态资源目录地址
            validate_path: 'validate', // 默认验证器目录地址
        }
    }, appConfig, cfg)
}