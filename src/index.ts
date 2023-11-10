/*
 * @Author: zhangyu
 * @Date: 2023-10-17 10:20:31
 * @LastEditTime: 2023-11-10 14:00:58
 */
import { Context } from 'koa'
import start from './start'
import { getConfig } from './config'
import { RouteType, ExceptionType } from './router'
import { Controller, ShowSuccess, ApiException, GetParams, View } from './controller'

export const appConfig = getConfig()
export { RouteType, ExceptionType, Context, Controller, ShowSuccess, GetParams, View }
export default {
    start,
    appConfig: getConfig(),
    Controller,
    ShowSuccess,
    ApiException,
    GetParams,
    View
}