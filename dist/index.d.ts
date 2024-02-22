/// <reference types="koa-websocket" />
import { Context } from 'koa';
import { getConfig as appConfig } from './config';
import { RouteType, ExceptionType } from './router';
import { Controller, ShowSuccess, ApiException, GetParams, View, M, Db, EDb, RDb, MDb } from './controller';
import { Utils } from './utils';
import Log4j from './log4j';
export { Context, RouteType, ExceptionType, Controller, appConfig, ShowSuccess, ApiException, GetParams, View, Log4j, Utils, M, Db, EDb, RDb, MDb };
declare const _default: {
    start: (cfg?: Record<string, any>) => Promise<void>;
    appConfig: (cfg?: Object) => {
        app: {
            port: number;
            configPath: string;
            koaBody: {
                multipart: boolean;
            };
            enableLog: boolean;
            log_info_filename: string;
            log_error_filename: string;
            log_error_pattern: string;
            route_path: string;
            controller_path: string;
            middleware_path: string;
            view_path: string;
            static_path: string;
            validate_path: string;
            utils_path: string;
            model_path: string;
            jwt_key: string;
            expiresIn: number;
            sqlDebug: boolean;
            createTime: string;
            updateTime: string;
            deleteTime: string;
        };
        ws: {
            enable: boolean;
            port: number;
            websocket_path: string;
        };
    } & Record<string, any> & Object;
    Controller: typeof Controller;
    ShowSuccess: (data?: any, msg?: string, code?: number, statusCode?: number) => {
        body: {
            code: number;
            msg: string;
            data: any;
        };
        status: number;
    };
    ApiException: (msg?: string, errorCode?: number, statusCode?: number) => void;
    GetParams: (ctx: Context, validate?: boolean, validate_path?: string | undefined) => any;
    View: (url: string, data?: Object, type?: "vue" | "react" | "layui") => Promise<{
        body: string;
        status: number;
    } | undefined>;
    Log4j: (str: string, level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal") => void;
    M: (modelPath: string) => Promise<any>;
    Db: (tableName?: string | undefined, db?: string | undefined) => import("./thinkdb").default;
    EDb: (db?: string | undefined) => import("./elasticsearch").default;
    RDb: (db?: string | undefined) => import("./thinkredis").default;
    MDb: (modelName: string, db?: string | undefined) => import("./mongodb").default;
};
export default _default;
