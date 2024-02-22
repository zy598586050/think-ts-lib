/// <reference types="koa-websocket" />
import { Context } from 'koa';
import ThinkDb from './thinkdb';
import ThinkEDb from './elasticsearch';
import ThinkRDb from './thinkredis';
import ThinkMDb from './mongodb';
type TMPType = 'vue' | 'react' | 'layui';
export declare class Controller {
    /**
     * 返回成功的Json数据
     * @param data 实际的数据
     * @param msg 状态消息
     * @param code 程序的状态码
     * @param statusCode 响应的状态码
     * @returns
     */
    ShowSuccess(data?: any, msg?: string, code?: number, statusCode?: number): {
        body: {
            code: number;
            msg: string;
            data: any;
        };
        status: number;
    };
    /**
     * 异常或错误返回的Json数据
     * @param msg 状态消息
     * @param errorCode 程序的状态码
     * @param statusCode 响应的状态码
     */
    ApiException(msg?: string, errorCode?: number, statusCode?: number): void;
    /**
     * 参数获取器
     * @param ctx 上下文
     * @param validate 控制是否开启对该控制器方法的参数校验 默认不开启
     * @param validate_path 自定义指定当前验证器路径
     */
    GetParams(ctx: Context, validate?: boolean, validate_path?: string): any;
    /**
     * 视图渲染
     * @param url 视图路径 后缀可带可不带
     * @param data 视图的数据
     * @param type 模板引擎的类型，默认是vue, 可以指定为react
     * @returns
     */
    View(url: string, data?: Object, type?: TMPType): Promise<{
        body: string;
        status: number;
    } | undefined>;
    /**
     * 调用模型
     * @param modelPath 模型路径
     */
    M(modelPath: string): Promise<any>;
    /**
     * ThinkDb数据库工具
     * @param tableName 表名
     * @param db 数据源
     * @returns
     */
    Db(tableName?: string, db?: string): ThinkDb;
    /**
     * Elasticsearch工具
     * @param db 数据源
     * @returns
     */
    EDb(db?: string): ThinkEDb;
    /**
     * redis工具
     * @param db 数据源
     * @returns
     */
    RDb(db?: string): ThinkRDb;
    /**
     * mongodb数据库工具
     * @param modelName 模型名
     * @param db 数据源
     * @returns
     */
    MDb(modelName: string, db?: string): ThinkMDb;
}
export declare const ShowSuccess: (data?: any, msg?: string, code?: number, statusCode?: number) => {
    body: {
        code: number;
        msg: string;
        data: any;
    };
    status: number;
}, ApiException: (msg?: string, errorCode?: number, statusCode?: number) => void, GetParams: (ctx: Context, validate?: boolean, validate_path?: string) => any, View: (url: string, data?: Object, type?: TMPType) => Promise<{
    body: string;
    status: number;
} | undefined>, M: (modelPath: string) => Promise<any>, Db: (tableName?: string, db?: string) => ThinkDb, EDb: (db?: string) => ThinkEDb, RDb: (db?: string) => ThinkRDb, MDb: (modelName: string, db?: string) => ThinkMDb;
export {};
