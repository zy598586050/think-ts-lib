/*
 * @Author: zhangyu
 * @Date: 2023-10-17 10:20:31
 * @LastEditTime: 2023-10-24 18:03:03
 */
import { Context } from 'koa'
import start from './start'
import { getConfig } from './config'
import { RouteType } from './router'
import { Controller, ShowSuccess, ApiException, GetParams } from './controller'

export const appConfig = getConfig()
export { RouteType, Context, Controller, ShowSuccess, GetParams }
export default {
    start,
    appConfig: getConfig(),
    Controller,
    ShowSuccess,
    ApiException,
    GetParams
}