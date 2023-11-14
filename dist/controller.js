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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.M = exports.View = exports.GetParams = exports.ApiException = exports.ShowSuccess = exports.Controller = void 0;
/*
 * @Author: zhangyu
 * @Date: 2023-10-24 12:15:53
 * @LastEditTime: 2023-11-14 18:08:34
 */
const path_1 = __importDefault(require("path"));
const exception_1 = require("./exception");
const config_1 = require("./config");
const errorcode_1 = require("./errorcode");
const server_renderer_1 = require("vue/server-renderer");
const view_1 = require("./view");
const validate_1 = require("./validate");
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
     * @param validate_path 自定义指定当前验证器路径
     */
    GetParams(ctx, validate = false, validate_path) {
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
        if (validate) {
            // 默认需要和控制器路径保持一致
            const validatePath = path_1.default.resolve(process.cwd(), `${(0, config_1.getConfig)().app.validate_path}/${validate_path || ctx.beforePath}${(validate_path || ctx.beforePath).endsWith('.ts') ? '' : '.ts'}`);
            Promise.resolve(`${validatePath}`).then(s => __importStar(require(s))).then((module) => {
                const validateObj = module.default;
                Object.keys(validateObj?.rule).forEach(key => {
                    // 只验证有验证规则的参数
                    // 1. key 要验证的键
                    // 2. result[key] 要验证的值
                    // 3. validateObj.rule[key] 验证规则
                    // 4. validateObj.message[key] 自定义验证提示
                    // 5. scene 分场景验证
                    (0, validate_1.Validate)(ctx, key, result, validateObj);
                });
            }).catch((error) => {
                console.log(error);
                ctx.body = {
                    msg: '验证器路径可能书写有误',
                    errorCode: errorcode_1.ErrorCode.ERROR_VALIDATE
                };
                ctx.status = 500;
            });
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
    /**
     * 调用模型
     * @param modelPath 模型路径
     */
    async M(modelPath) {
        let model = null;
        const modelDir = path_1.default.resolve(process.cwd(), `${(0, config_1.getConfig)().app.model_path}/${modelPath}${modelPath.endsWith('.ts') ? '' : '.ts'}`);
        try {
            const module = await Promise.resolve(`${modelDir}`).then(s => __importStar(require(s)));
            model = new module.default();
        }
        catch (error) {
            console.log(error);
            throw new exception_1.HttpException({
                msg: `模型有误[${modelPath}]`,
                errorCode: errorcode_1.ErrorCode.ERROR_MODEL,
                statusCode: 500
            });
        }
        return model;
    }
}
exports.Controller = Controller;
_a = new Controller(), exports.ShowSuccess = _a.ShowSuccess, exports.ApiException = _a.ApiException, exports.GetParams = _a.GetParams, exports.View = _a.View, exports.M = _a.M;
