/// <reference types="koa-websocket" />
import { Context } from 'koa';
import koaRouter from 'koa-router';
export interface RouteType {
    get: (url: string, str: string, middleware?: MiddleWareType) => void;
    post: (url: string, str: string, middleware?: MiddleWareType) => void;
    put: (url: string, str: string, middleware?: MiddleWareType) => void;
    delete: (url: string, str: string, middleware?: MiddleWareType) => void;
    group: (prefix: string, callback: any, middleware?: MiddleWareType) => void;
}
type MiddleWareType = (ctx: Context, next: () => void, error: (msg?: string, errorCode?: number, statusCode?: number) => void) => void;
export type ExceptionType = (msg?: string, errorCode?: number, statusCode?: number) => void;
declare const router: koaRouter<any, {}>;
export default router;
