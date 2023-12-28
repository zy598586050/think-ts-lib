/**
 * .vue 文件转 html
 * @param url .vue文件路径
 * @returns
 */
export declare const vueRenderToString: (url: string, data: Object) => Promise<string>;
/**
 * .jsx 文件转 html
 * @param url .jsx文件路径
 * @returns
 */
export declare const reactRenderToString: (url: string, data: Object) => Promise<string>;
