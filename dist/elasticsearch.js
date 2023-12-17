"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: zhangyu
 * @Date: 2023-11-21 11:43:33
 * @LastEditTime: 2023-12-14 18:19:28
 */
const elasticsearch_1 = require("@elastic/elasticsearch");
const config_1 = require("./config");
class ElasticSearch {
    // 配置
    elasticSearchConfig;
    // 连接
    client;
    // 构造函数初始化
    constructor(db = '') {
        this.elasticSearchConfig = (0, config_1.getConfig)()?.elasticsearch || {};
        Object.keys(this.elasticSearchConfig).forEach((key, index) => {
            if (index === 0 && !db)
                db = key;
        });
        this.client = new elasticsearch_1.Client({
            node: `http://${this.elasticSearchConfig[db].host}:${this.elasticSearchConfig[db].prot}`
        });
    }
    /**
     * 创建索引
     * @param index 索引
     * @param body 结构
     * @returns
     */
    createIndex(index, body) {
        return this.client?.indices.create({ index, body });
    }
    /**
     * 添加文档
     * @param index 索引
     * @param body 结构
     * @returns
     */
    addDocument(index, body) {
        return this.client?.index({ index, body });
    }
    /**
     * 查询
     * @param index 索引
     * @param body 查询结构
     */
    search(index, body) {
        return this.client?.search({ index, body });
    }
}
exports.default = ElasticSearch;
