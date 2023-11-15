/*
 * @Author: zhangyu
 * @Date: 2023-10-24 12:15:53
 * @LastEditTime: 2023-11-15 18:23:36
 */
import path from 'path'
import { Context } from 'koa'
import { HttpException } from './exception'
import { getConfig } from './config'
import { ErrorCode } from './errorcode'
import { renderToString } from 'vue/server-renderer'
import { createApp, importVue, htmlView } from './view'
import { Validate } from './validate'
import ThinkDb from './thinkdb'

type VueType = 'vue' | 'react'

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
     * @param validate_path 自定义指定当前验证器路径
     */
    GetParams(ctx: Context, validate: boolean = false, validate_path?: string) {
        let result: any = {}

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

        if (validate) {
            // 默认需要和控制器路径保持一致
            const validatePath = path.resolve(process.cwd(), `${getConfig().app.validate_path}/${validate_path || ctx.beforePath}${(validate_path || ctx.beforePath).endsWith('.ts') ? '' : '.ts'}`)
            import(validatePath).then((module) => {
                const validateObj = module.default
                Object.keys(validateObj?.rule || {}).forEach(key => {
                    // 只验证有验证规则的参数
                    // 1. key 要验证的键
                    // 2. result[key] 要验证的值
                    // 3. validateObj.rule[key] 验证规则
                    // 4. validateObj.message[key] 自定义验证提示
                    // 5. scene 分场景验证
                    Validate(ctx, key, result, validateObj)
                })
            }).catch((error) => {
                console.log(error)
                ctx.body = {
                    msg: '验证器路径可能书写有误',
                    errorCode: ErrorCode.ERROR_VALIDATE
                }
                ctx.status = 500
            })
        }
        return result
    }

    /**
     * 视图渲染
     * @param url 视图路径 后缀可带可不带
     * @param data 视图的数据
     * @param type 模板引擎的类型，默认是vue, 可以指定为react
     * @returns 
     */
    async View(url: string, data: Object = {}, type: VueType = 'vue') {
        if (type === 'vue') {
            let body = ''
            try {
                const { style, template, vueObj } = importVue(url)
                const app = createApp(data, template, vueObj)
                body = await renderToString(app)
                body = htmlView(style, body, data, template, vueObj)
            } catch (error) {
                console.log(error)
                throw new HttpException({
                    msg: '视图文件解析失败',
                    errorCode: ErrorCode.ERROR_VIEW,
                    statusCode: 404
                })
            }
            return { body, status: 200 }
        } else if (type === 'react') {
            // TODO
        }
    }

    /**
     * 调用模型
     * @param modelPath 模型路径
     */
    async M(modelPath: string) {
        let model = null
        const modelDir = path.resolve(process.cwd(), `${getConfig().app.model_path}/${modelPath}${modelPath.endsWith('.ts') ? '' : '.ts'}`)
        try {
            const module = await import(modelDir)
            model = new module.default()
        } catch (error) {
            console.log(error)
            throw new HttpException({
                msg: `模型有误[${modelPath}]`,
                errorCode: ErrorCode.ERROR_MODEL,
                statusCode: 500
            })
        }
        return model
    }

    Db(tableName?: string, db?: string) {
        return new ThinkDb().Db(tableName, db)
    }
}

export const { ShowSuccess, ApiException, GetParams, View, M, Db } = new Controller()