/*
 * @Author: zhangyu
 * @Date: 2023-10-18 10:15:00
 * @LastEditTime: 2023-10-18 10:17:39
 */
export enum ErrorCode {
    ERROR_CODE = 10000, // 代码书写错误
    ERROR_ROUTE = 20000, // 路由错误
    ERROR_VALIDATE = 30000, // 验证错误
    ERROR_TOKEN = 30001, // TOKEN过期
    ERROR_MYSQL = 40000, // mysql数据库错误
    ERROR_REDIS = 50000, // redis错误
    ERROR_ES = 60000, // elasticsearch错误
    ERROR_MONGODB = 70000, // MongoDB错误
}