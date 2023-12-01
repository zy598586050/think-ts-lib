import { Context } from 'koa';
interface VALIDATE {
    rule: any;
    message: any;
    scene: any;
}
/**
 * 验证器
 * @param ctx 上下文
 * @param key 当前验证的键
 * @param params 请求的入参
 * @param validateObj 验证器对象
 */
export declare const Validate: (ctx: Context, key: string, params: any, validateObj: VALIDATE) => void;
export {};
