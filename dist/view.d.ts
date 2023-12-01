interface VUETYPE {
    data?: any;
    methods?: any;
}
/**
 * 同构实例
 * @param data 根组件数据
 * @param template 模板字符串
 * @param obj 对象
 * @returns
 */
export declare const createApp: (data: Object, template: string, obj: VUETYPE) => import("vue").App<Element>;
/**
 * 最终渲染的html
 * @param style 样式
 * @param ssr vue服务端渲染
 * @returns
 */
export declare const htmlView: (style: string, ssr: string, data: Object, template: string, obj: VUETYPE) => string;
/**
 * 解析.vue文件
 * @param url
 * @returns
 */
export declare const importVue: (url: string) => {
    template: string;
    style: string;
    vueObj: any;
};
export {};
