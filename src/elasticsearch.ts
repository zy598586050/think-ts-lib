/*
 * @Author: zhangyu
 * @Date: 2023-11-21 11:43:33
 * @LastEditTime: 2023-12-14 18:19:28
 */
import { Client } from '@elastic/elasticsearch'
import { getConfig } from './config'

interface DBOBJECT {
    [key: string]: any
}

export default class ElasticSearch {

    // 配置
    elasticSearchConfig: DBOBJECT
    // 连接
    client?: Client

    // 构造函数初始化
    constructor(db: string = '') {
        this.elasticSearchConfig = getConfig()?.elasticsearch || {}
        Object.keys(this.elasticSearchConfig).forEach((key, index) => {
            if (index === 0 && !db) db = key
        })
        this.client = new Client({
            node: `http://${this.elasticSearchConfig[db].host}:${this.elasticSearchConfig[db].prot}`
        })
    }

    /**
     * 创建索引
     * @param index 索引
     * @param body 结构
     * @returns 
     */
    createIndex(index: string, body?: DBOBJECT) {
        return this.client?.indices.create({ index, body })
    }

    /**
     * 添加文档
     * @param index 索引
     * @param body 结构
     * @returns 
     */
    addDocument(index: string, body: DBOBJECT) {
        return this.client?.index({ index, body })
    }
    
    /**
     * 查询
     * @param index 索引
     * @param body 查询结构
     */
    search(index: string, body: DBOBJECT) {
        return this.client?.search({ index, body })
    }
}