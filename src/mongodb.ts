/*
 * @Author: zhangyu
 * @Date: 2023-11-21 18:18:15
 * @LastEditTime: 2023-11-22 12:23:49
 */
import mongoose, { Schema } from 'mongoose'
import { getConfig } from './config'
import { Utils } from './utils'

interface DBOBJECT {
    [key: string]: any
}

export default class MongoDb {

    // 配置
    mongodbConfig: DBOBJECT
    // 模型名
    modelName: string = ''
    // 模型
    model: any

    // 构造函数初始化
    constructor(modelName: string = '', db: string = '') {
        this.modelName = modelName
        this.mongodbConfig = getConfig()?.mongodb || {}
        Object.keys(this.mongodbConfig).forEach((key, index) => {
            if (index === 0) db = key
        })
        mongoose.connect(`mongodb://${this.mongodbConfig[db].user}:${this.mongodbConfig[db].password}@${this.mongodbConfig[db].host}:${this.mongodbConfig[db].port}/${this.mongodbConfig[db].database}`)
    }

    /**
     * 创建模型
     * @param obj 模型对象
     * @param options 设置选项
     * -------@param isAutoTime 是否开启自动时间戳，默认不开启
     * -------@param createTime 创建时间字段名，默认 create_time
     * -------@param updateTime 更新时间字段名，默认 update_time
     */
    M(obj: DBOBJECT, options: { isAutoTime?: boolean; createTime?: string; updateTime?: string } = {}) {
        const { isAutoTime, createTime, updateTime } = { isAutoTime: false, createTime: getConfig()?.app?.createTime, updateTime: getConfig()?.app?.updateTime, ...options }
        const schema = new Schema({
            ...obj,
            ...(isAutoTime ? {
                [createTime]: {
                    type: Date,
                    default: Date.now
                },
                [updateTime]: {
                    type: Date,
                    default: Date.now
                }
            } : {})
        })
        this.model = mongoose.model(Utils.firstToUpper(this.modelName), schema)
        return this
    }

    /**
     * 新增数据
     * @param obj 数据
     * @param options 设置选项
     * -------@param isAutoTime 是否开启自动时间戳，默认不开启
     * -------@param createTime 创建时间字段名，默认 create_time
     * -------@param updateTime 更新时间字段名，默认 update_time
     * @returns 
     */
    insert(obj: DBOBJECT, options: { isAutoTime?: boolean; createTime?: string; updateTime?: string } = {}) {
        const { isAutoTime, createTime, updateTime } = { isAutoTime: false, createTime: getConfig()?.app?.createTime, updateTime: getConfig()?.app?.updateTime, ...options }
        const newModel = new this.model({
            ...obj,
            ...(isAutoTime ? {
                [createTime]: Date.now,
                [updateTime]: Date.now
            } : {})
        })
        return newModel.save()
    }

    /**
     * 查询数据
     * @param whereObj 查询条件
     * @param current 第几页
     * @param size 每页多少条
     * @returns 
     */
    select(whereObj: DBOBJECT = {}, current?: number, size?: number) {
        if (current && size) {
            return this.model.find(whereObj).skip((current - 1) * size).limit(size)
        } else {
            return this.model.find(whereObj)
        }
    }

    /**
     * 更新数据
     * @param whereObj 限制条件
     * @param updateObj 更新数据
     */
    update(whereObj: DBOBJECT, updateObj: DBOBJECT) {
        return this.model.updateOne(whereObj, updateObj)
    }

    /**
     * 删除数据
     * @param whereObj 限制条件
     */
    delete(whereObj: DBOBJECT) {
        return this.model.deleteOne(whereObj)
    }
}