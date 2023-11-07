/*
 * @Author: zhangyu
 * @Date: 2023-10-28 16:59:04
 * @LastEditTime: 2023-10-28 19:38:47
 */

/**
 * 将视图代码文本中template内容解析出来
 * @param str 模版文本
 */
export const getVueTemplate = (str: string): string => {
    return '<div @click="count++">{{ count }}</div>'
}

/**
 * 最终渲染的html
 * @param str 模版文本
 */
export const getHtml = (str: string) => { }