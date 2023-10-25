/*
 * @Author: zhangyu
 * @Date: 2023-10-24 12:15:53
 * @LastEditTime: 2023-10-25 10:07:31
 */
import * as fs from 'fs'
import * as path from 'path'
import { Context } from 'koa'
import { HttpException } from './exception'
import { getConfig } from './config'
import { ErrorCode } from './errorcode'
import { createSSRApp } from 'vue'
import { renderToString } from '@vue/server-renderer'

type VueType = 'vue' | 'react'
const config = getConfig()

export class Controller {
    /**
     * 返回成功的Json数据
     * @param data 实际的数据
     * @param msg 状态消息
     * @param code 程序的状态码
     * @param statusCode 响应的状态码
     * @returns 
     */
    ShowSuccess(data: any = [], msg: string = 'ok', code: number = 200, statusCode: number = 200) {
        return {
            body: {
                code,
                msg,
                data
            },
            status: statusCode
        }
    }

    /**
     * 异常或错误返回的Json数据
     * @param msg 状态消息
     * @param errorCode 程序的状态码
     * @param statusCode 响应的状态码
     */
    ApiException(msg: string = '请求错误', errorCode: number = 30000, statusCode: number = 400) {
        throw new HttpException({
            msg,
            errorCode,
            statusCode
        })
    }

    /**
     * 参数获取器
     * @param ctx 上下文
     * @param validate 控制是否开启对该控制器方法的参数校验 默认不开启
     */
    GetParams(ctx: Context, validate: boolean = false) {
        let result = {}

        switch (ctx.request.method) {
            case 'GET':
                result = ctx.request.query
                break
            case 'POST':
                result = ctx.request.body
                break
            case 'PUT':
                result = ctx.request.body
                break;
            case 'DELETE':
                result = ctx.request.query
                break
            default:
                break
        }

        return result
    }

    /**
     * 视图渲染
     * @param url 视图路径
     * @param data 视图的数据
     * @param type 模板引擎的类型，默认是vue, 可以指定为react
     * @returns 
     */
    View(url: string, data: Object, type: VueType = 'vue') {
        if (type === 'vue') {
            let template = ''
            try {
                const viewPath = path.resolve(process.cwd(), `${config.app.view_path}/${url}`)
                template = fs.readFileSync(viewPath, 'utf-8')
            } catch (error) {
                console.log(error)
                throw new HttpException({
                    msg: '找不到视图文件',
                    errorCode: ErrorCode.ERROR_VIEW,
                    statusCode: 404
                })
            }
            const app = createSSRApp({
                data() {
                    return data
                },
                template
            })
            return renderToString(app)
        } else if (type === 'react') {}
    }
}

/**
 * 返回成功的Json数据
 * @param data 实际的数据
 * @param msg 状态消息
 * @param code 程序的状态码
 * @param statusCode 响应的状态码
 * @returns 
 */
export const ShowSuccess = (data: any = [], msg: string = 'ok', code: number = 200, statusCode: number = 200) => {
    return {
        code,
        msg,
        data,
        statusCode
    }
}

/**
 * 异常或错误返回的Json数据
 * @param msg 状态消息
 * @param errorCode 程序的状态码
 * @param statusCode 响应的状态码
 */
export const ApiException = (msg: string = '请求错误', errorCode: number = 30000, statusCode: number = 400) => {
    throw new HttpException({
        msg,
        errorCode,
        statusCode
    })
}

/**
 * 参数获取器
 * @param ctx 上下文
 * @param validate 控制是否开启对该控制器方法的参数校验 默认不开启
 */
export const GetParams = (ctx: Context, validate: boolean = false) => {
    let result = {}

    switch (ctx.request.method) {
        case 'GET':
            result = ctx.request.query
            break
        case 'POST':
            result = ctx.request.body
            break
        case 'PUT':
            result = ctx.request.body
            break;
        case 'DELETE':
            result = ctx.request.query
            break
        default:
            break
    }

    return result
}