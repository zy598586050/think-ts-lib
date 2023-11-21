/*
 * @Author: zhangyu
 * @Date: 2023-10-17 10:20:31
 * @LastEditTime: 2023-11-21 20:16:50
 */
import start from './start'
import { getConfig } from './config'
import { RouteType, ExceptionType } from './router'
import { Controller, ShowSuccess, ApiException, GetParams, View, M, Db, EDb, RDb, MDb } from './controller'
import Log4j from './log4j'
import { Utils } from './utils'

export const appConfig = getConfig()
export { RouteType, ExceptionType, Controller, ShowSuccess, ApiException, GetParams, View, Log4j, Utils, M, Db, EDb, RDb, MDb }
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
    M,
    Db,
    EDb,
    RDb,
    MDb
}