"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = exports.GetParams = exports.ApiException = exports.ShowSuccess = exports.Controller = void 0;
const exception_1 = require("./exception");
const config_1 = require("./config");
const errorcode_1 = require("./errorcode");
const server_renderer_1 = require("vue/server-renderer");
const view_1 = require("./view");
const config = (0, config_1.getConfig)();
class Controller {
    /**
     * 返回成功的Json数据
     * @param data 实际的数据
     * @param msg 状态消息
     * @param code 程序的状态码
     * @param statusCode 响应的状态码
     * @returns
     */
    ShowSuccess(data = [], msg = 'ok', code = 200, statusCode = 200) {
        return {
            body: {
                code,
                msg,
                data
            },
            status: statusCode
        };
    }
    /**
     * 异常或错误返回的Json数据
     * @param msg 状态消息
     * @param errorCode 程序的状态码
     * @param statusCode 响应的状态码
     */
    ApiException(msg = '请求错误', errorCode = 30000, statusCode = 400) {
        throw new exception_1.HttpException({
            msg,
            errorCode,
            statusCode
        });
    }
    /**
     * 参数获取器
     * @param ctx 上下文
     * @param validate 控制是否开启对该控制器方法的参数校验 默认不开启
     */
    GetParams(ctx, validate = false) {
        let result = {};
        switch (ctx.request.method) {
            case 'GET':
                result = ctx.request.query;
                break;
            case 'POST':
                result = ctx.request.body;
                break;
            case 'PUT':
                result = ctx.request.body;
                break;
            case 'DELETE':
                result = ctx.request.query;
                break;
            default:
                break;
        }
        return result;
    }
    /**
     * 视图渲染
     * @param url 视图路径 后缀可带可不带
     * @param data 视图的数据
     * @param type 模板引擎的类型，默认是vue, 可以指定为react
     * @returns
     */
    async View(url, data = {}, type = 'vue') {
        if (type === 'vue') {
            let body = '';
            try {
                const { style, template, vueObj } = (0, view_1.importVue)(url);
                const app = (0, view_1.createApp)(data, template, vueObj);
                body = await (0, server_renderer_1.renderToString)(app);
                body = (0, view_1.htmlView)(style, body, data, template, vueObj);
            }
            catch (error) {
                console.log(error);
                throw new exception_1.HttpException({
                    msg: '视图文件解析失败',
                    errorCode: errorcode_1.ErrorCode.ERROR_VIEW,
                    statusCode: 404
                });
            }
            return { body, status: 200 };
        }
        else if (type === 'react') {
            // TODO
        }
    }
}
exports.Controller = Controller;
/**
 * 返回成功的Json数据
 * @param data 实际的数据
 * @param msg 状态消息
 * @param code 程序的状态码
 * @param statusCode 响应的状态码
 * @returns
 */
const ShowSuccess = (data = [], msg = 'ok', code = 200, statusCode = 200) => {
    return {
        code,
        msg,
        data,
        statusCode
    };
};
exports.ShowSuccess = ShowSuccess;
/**
 * 异常或错误返回的Json数据
 * @param msg 状态消息
 * @param errorCode 程序的状态码
 * @param statusCode 响应的状态码
 */
const ApiException = (msg = '请求错误', errorCode = 30000, statusCode = 400) => {
    throw new exception_1.HttpException({
        msg,
        errorCode,
        statusCode
    });
};
exports.ApiException = ApiException;
/**
 * 参数获取器
 * @param ctx 上下文
 * @param validate 控制是否开启对该控制器方法的参数校验 默认不开启
 */
const GetParams = (ctx, validate = false) => {
    let result = {};
    switch (ctx.request.method) {
        case 'GET':
            result = ctx.request.query;
            break;
        case 'POST':
            result = ctx.request.body;
            break;
        case 'PUT':
            result = ctx.request.body;
            break;
        case 'DELETE':
            result = ctx.request.query;
            break;
        default:
            break;
    }
    return result;
};
exports.GetParams = GetParams;
/**
 * 视图渲染
 * @param url 视图路径 后缀可带可不带
 * @param data 视图的数据
 * @param type 模板引擎的类型，默认是vue, 可以指定为react
 * @returns
 */
const View = async (url, data = {}, type = 'vue') => {
    if (type === 'vue') {
        let body = '';
        try {
            const { style, template, vueObj } = (0, view_1.importVue)(url);
            const app = (0, view_1.createApp)(data, template, vueObj);
            body = await (0, server_renderer_1.renderToString)(app);
            body = (0, view_1.htmlView)(style, body, data, template, vueObj);
        }
        catch (error) {
            console.log(error);
            throw new exception_1.HttpException({
                msg: '视图文件解析失败',
                errorCode: errorcode_1.ErrorCode.ERROR_VIEW,
                statusCode: 404
            });
        }
        return { body, status: 200 };
    }
    else if (type === 'react') {
        // TODO
    }
};
exports.View = View;
