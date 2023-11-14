/*
 * @Author: zhangyu
 * @Date: 2023-10-17 10:20:31
 * @LastEditTime: 2023-11-14 17:16:53
 */
import { Context } from 'koa'
import start from './start'
import { getConfig } from './config'
import { RouteType, ExceptionType } from './router'
import { Controller, ShowSuccess, ApiException, GetParams, View, M } from './controller'
import Log4j from './log4j'
import { Utils } from './utils'

export const appConfig = getConfig()
export { RouteType, ExceptionType, Context, Controller, ShowSuccess, ApiException, GetParams, View, Log4j, Utils, M }
export default {
    start,
    appConfig: getConfig(),
    Controller,
    ShowSuccess,
    ApiException,
    GetParams,
    View,
    Log4j,
    Utils,
    M
}