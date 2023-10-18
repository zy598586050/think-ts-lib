/*
 * @Author: zhangyu
 * @Date: 2023-10-17 10:20:31
 * @LastEditTime: 2023-10-18 11:29:29
 */
import start from './start'
import { getConfig } from './config'
import { RouteType } from './router'

export const appConfig = getConfig()
export { RouteType }
export default {
    start,
    appConfig: getConfig()
}