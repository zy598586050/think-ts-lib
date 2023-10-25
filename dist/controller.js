"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetParams = exports.ApiException = exports.ShowSuccess = exports.Controller = void 0;
/*
 * @Author: zhangyu
 * @Date: 2023-10-24 12:15:53
 * @LastEditTime: 2023-10-24 20:46:09
 */
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const exception_1 = require("./exception");
const config_1 = require("./config");
const errorcode_1 = require("./errorcode");
const vue_1 = require("vue");
const server_renderer_1 = require("@vue/server-renderer");
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
     * @param url 视图路径
     * @param data 视图的数据
     * @param type 模板引擎的类型，默认是vue, 可以指定为react
     * @returns
     */
    View(url, data, type = 'vue') {
        if (type === 'vue') {
            let template = '';
            try {
                const viewPath = path.resolve(process.cwd(), `${config.app.view_path}/${url}`);
                template = fs.readFileSync(viewPath, 'utf-8');
            }
            catch (error) {
                console.log(error);
                throw new exception_1.HttpException({
                    msg: '找不到视图文件',
                    errorCode: errorcode_1.ErrorCode.ERROR_VIEW,
                    statusCode: 404
                });
            }
            const app = (0, vue_1.createSSRApp)({
                data() {
                    return data;
                },
                template
            });
            return (0, server_renderer_1.renderToString)(app);
        }
        else if (type === 'react') { }
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
