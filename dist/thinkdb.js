"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * @Author: zhangyu
 * @Date: 2023-11-15 10:45:17
 * @LastEditTime: 2023-11-15 21:03:26
 */
const promise_1 = require("mysql2/promise");
const config_1 = require("./config");
class ThinkDb {
    // 连接池
    pool = {};
    // 数据源 默认第一个
    db = '';
    // 表名称
    tableName = '';
    // 查询的字段
    fieldStr = '*';
    // 条件
    whereStr = '';
    // 值的集合
    values = [];
    // 最后执行的查询语句
    lastSql = '';
    // 构造函数
    constructor() {
        const that = this;
        const mysqlConfig = (0, config_1.getConfig)()?.mysql || {};
        Object.keys(mysqlConfig).forEach((key, index) => {
            if (index === 0)
                this.db = key;
            that.pool[key] = (0, promise_1.createPool)({
                host: mysqlConfig[key].host,
                port: mysqlConfig[key].port,
                user: mysqlConfig[key].user,
                password: mysqlConfig[key].password,
                database: mysqlConfig[key].database,
                connectionLimit: mysqlConfig[key].connectionLimit
            });
        });
    }
    /**
     * 查询实例
     * @param tableName 表名称
     * @param db 数据源
     */
    Db(tableName = '', db = this.db) {
        this.db = db;
        this.tableName = tableName;
        return this;
    }
    /**
     * 指定要显示的字段
     * @param str 字段名用英文逗号隔开，如：id,name,age
     * @returns
     */
    field(str) {
        this.fieldStr = str;
        return this;
    }
    /**
     * 单条件查询
     * @param field 字段名
     * @param condition 条件
     * @param value 值
     * @returns
     */
    where(field, condition, value) {
        this.whereStr = `WHERE ${field} ${arguments.length === 2 ? '=' : condition} ? `;
        this.values.push(arguments.length === 2 ? condition : value);
        return this;
    }
    /**
     * 多条件查询AND，前边必须要有where的调用
     * @param field 字段名
     * @param condition 条件
     * @param value 值
     * @returns
     */
    whereAnd(field, condition, value) {
        this.whereStr += `AND ${field} ${arguments.length === 2 ? '=' : condition} ? `;
        this.values.push(arguments.length === 2 ? condition : value);
        return this;
    }
    /**
     * 多条件查询OR，前边必须要有where的调用
     * @param field 字段名
     * @param condition 条件
     * @param value 值
     * @returns
     */
    whereOr(field, condition, value) {
        this.whereStr += `OR ${field} ${arguments.length === 2 ? '=' : condition} ? `;
        this.values.push(arguments.length === 2 ? condition : value);
        return this;
    }
    /**
     * 多条件查询IN
     * @param field 字段名
     * @param value 值 注意一般这里传一个数组
     * @returns
     */
    whereIn(field, value) {
        this.whereStr += `${this.whereStr.includes('WHERE') ? 'AND' : 'WHERE'} ${field} IN (?) `;
        this.values.push(value);
        return this;
    }
    /**
     * 多条件查询LIKE
     * @param field 字段名
     * @param value 值 注意一般这里传一个字符串，带上通配符，使用 %（代表零个或多个字符）和 _（代表单个字符）进行模糊匹配
     * @returns
     */
    whereLike(field, value) {
        this.whereStr += `${this.whereStr.includes('WHERE') ? 'AND' : 'WHERE'} ${field} LIKE ? `;
        this.values.push(value);
        return this;
    }
    /**
     * 多条件查询BETWEEN
     * @param field 字段名
     * @param value1 值1
     * @param value2 值2
     * @returns
     */
    whereBetween(field, value1, value2) {
        this.whereStr += `${this.whereStr.includes('WHERE') ? 'AND' : 'WHERE'} ${field} BETWEEN ? AND ? `;
        this.values.push(value1, value2);
        return this;
    }
    /**
     * 多条件查询IS NULL
     * @param field 字段名
     * @returns
     */
    whereIsNull(field) {
        this.whereStr += `${this.whereStr.includes('WHERE') ? 'AND' : 'WHERE'} ${field} IS NULL `;
        return this;
    }
    /**
     * 多条件查询IS NOT NULL
     * @param field 字段名
     * @returns
     */
    whereIsNotNull(field) {
        this.whereStr += `${this.whereStr.includes('WHERE') ? 'AND' : 'WHERE'} ${field} IS NOT NULL `;
        return this;
    }
    /**
     * 查询多条数据
     * @param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * @returns
     */
    async select(isShowSql = false) {
        this.lastSql = (0, promise_1.format)(`SELECT ${this.fieldStr} FROM ${this.tableName} ${this.whereStr}`, this.values);
        if (isShowSql)
            console.log(`SQL: ${this.lastSql}`);
        const [rows] = await this.pool[this.db].execute(this.lastSql);
        return rows || [];
    }
    /**
     * 自定义SQL语句查询
     * @param sql 查询语句，防止注入请用?占位
     * @param values 匹配?的值
     * @param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * @returns
     */
    async query(sql, values = [], isShowSql = false) {
        this.lastSql = (0, promise_1.format)(sql, values);
        if (isShowSql)
            console.log(`SQL: ${this.lastSql}`);
        const [rows] = await this.pool[this.db].execute(this.lastSql);
        return rows || [];
    }
}
exports.default = ThinkDb;
