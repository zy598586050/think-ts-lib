/*
 * @Author: zhangyu
 * @Date: 2023-11-15 10:45:17
 * @LastEditTime: 2023-11-16 19:09:06
 */
import { createPool, Pool, format } from 'mysql2/promise'
import { getConfig } from './config'
import moment from 'moment'

type CONDITION = '=' | '!=' | '>' | '<' | '>=' | '<=' | '<>'
type SORT = 'DESC' | 'ASC'
interface DBOBJECT {
    [key: string]: any
}

export default class ThinkDb {

    // 连接池
    pool: { [key: string]: Pool } = {}
    // 数据源 默认第一个
    db: string = ''
    // 表名称
    tableName: string = ''
    // 查询的字段
    fieldStr: string = '*'
    // 条件
    whereStr: string = ''
    // 值的集合
    values: (string | number | (string | number)[])[] = []
    // 最后执行的查询语句
    lastSql: string = ''

    // 构造函数
    constructor() {
        const mysqlConfig = getConfig()?.mysql || {}
        Object.keys(mysqlConfig).forEach((key, index) => {
            if (index === 0) this.db = key
            this.pool[key] = createPool({
                host: mysqlConfig[key].host,
                port: mysqlConfig[key].port,
                user: mysqlConfig[key].user,
                password: mysqlConfig[key].password,
                database: mysqlConfig[key].database,
                connectionLimit: mysqlConfig[key].connectionLimit
            })
        })
    }

    /**
     * 查询实例
     * @param tableName 表名称
     * @param db 数据源
     */
    Db(tableName: string = '', db: string = this.db) {
        this.db = db
        this.tableName = tableName
        return this
    }

    /**
     * 单条件查询
     * @param field 字段名
     * @param condition 条件
     * @param value 值
     * @returns 
     */
    where(field: string, condition: CONDITION, value: string | number) {
        this.whereStr = `WHERE ${field} ${arguments.length === 2 ? '=' : condition} ? `
        this.values.push(arguments.length === 2 ? condition : value)
        return this
    }

    /**
     * 多条件查询AND，前边必须要有where的调用
     * @param field 字段名
     * @param condition 条件
     * @param value 值
     * @returns 
     */
    whereAnd(field: string, condition: CONDITION, value: string | number) {
        this.whereStr += `AND ${field} ${arguments.length === 2 ? '=' : condition} ? `
        this.values.push(arguments.length === 2 ? condition : value)
        return this
    }

    /**
     * 多条件查询OR，前边必须要有where的调用
     * @param field 字段名
     * @param condition 条件
     * @param value 值
     * @returns 
     */
    whereOr(field: string, condition: CONDITION, value: string | number) {
        this.whereStr += `OR ${field} ${arguments.length === 2 ? '=' : condition} ? `
        this.values.push(arguments.length === 2 ? condition : value)
        return this
    }

    /**
     * 多条件查询IN
     * @param field 字段名
     * @param value 值 注意一般这里传一个数组
     * @returns 
     */
    whereIn(field: string, value: (string | number)[] | string | number) {
        this.whereStr += `${this.whereStr.includes('WHERE') ? 'AND' : 'WHERE'} ${field} IN (?) `
        this.values.push(value)
        return this
    }

    /**
     * 多条件查询LIKE
     * @param field 字段名
     * @param value 值 注意一般这里传一个字符串，带上通配符，使用 %（代表零个或多个字符）和 _（代表单个字符）进行模糊匹配
     * @returns 
     */
    whereLike(field: string, value: string | number) {
        this.whereStr += `${this.whereStr.includes('WHERE') ? 'AND' : 'WHERE'} ${field} LIKE ? `
        this.values.push(value)
        return this
    }

    /**
     * 多条件查询BETWEEN
     * @param field 字段名
     * @param value1 值1
     * @param value2 值2
     * @returns 
     */
    whereBetween(field: string, value1: string | number, value2: string | number) {
        this.whereStr += `${this.whereStr.includes('WHERE') ? 'AND' : 'WHERE'} ${field} BETWEEN ? AND ? `
        this.values.push(value1, value2)
        return this
    }

    /**
     * 多条件查询IS NULL
     * @param field 字段名
     * @returns 
     */
    whereIsNull(field: string) {
        this.whereStr += `${this.whereStr.includes('WHERE') ? 'AND' : 'WHERE'} ${field} IS NULL `
        return this
    }

    /**
     * 多条件查询IS NOT NULL
     * @param field 字段名
     * @returns 
     */
    whereIsNotNull(field: string) {
        this.whereStr += `${this.whereStr.includes('WHERE') ? 'AND' : 'WHERE'} ${field} IS NOT NULL `
        return this
    }

    /**
     * 排序
     * @param field 排序的字段
     * @param sort 排序规则，DESC倒序 ASC正序
     * @returns 
     */
    order(field: string, sort: SORT = 'DESC') {
        this.whereStr += `ORDER BY ${field} ${sort} `
        return this
    }

    /**
     * 分页查询
     * @param current 第几页
     * @param size 每页显示多少条
     * @returns 
     */
    page(current: number, size: number) {
        this.whereStr += `LIMIT ${(current - 1) * size}, ${size}`
        return this
    }

    /**
     * 限制查询的条数
     * @param num 要查询的条数
     * @returns 
     */
    limit(num: number) {
        this.whereStr += `LIMIT ${num}`
        return this
    }

    /**
     * 指定要显示的字段
     * @param str 字段名用英文逗号隔开，如：id,name,age
     * @param isDistinct 是否去重，默认不开启
     * @returns 
     */
    field(str: string, isDistinct: boolean = false) {
        this.fieldStr = `${isDistinct ? 'DISTINCT ' : ''}${str}`
        return this
    }

    /**
     * 分组查询
     * @param field 字段名
     * @returns 
     */
    group(field: string) {
        this.whereStr += `GROUP BY ${field} `
        return this
    }

    /**
     * 新增一条数据
     * @param obj 数据对象
     * @param options 设置选项
     * -------@param isAutoTime 是否开启自动时间戳，默认不开启
     * -------@param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * -------@param createTime 创建时间字段名，默认 create_time
     * -------@param updateTime 更新时间字段名，默认 update_time
     */
    async insert(obj: DBOBJECT = {}, options: { isAutoTime?: boolean; isShowSql?: boolean; createTime?: string; updateTime?: string } = {}) {
        const { isAutoTime, isShowSql, createTime, updateTime } = { isAutoTime: false, isShowSql: false, createTime: getConfig()?.app?.createTime, updateTime: getConfig()?.app?.updateTime, ...options }
        const len = Object.keys(obj).length
        if (len > 0) {
            let keyStr = ''
            let valueStr = ''
            Object.keys(obj).forEach((key, index) => {
                keyStr += `${key}${index === len - 1 ? '' : ', '}`
                valueStr += `?${index === len - 1 ? '' : ', '}`
                this.values.push(obj[key])
            })
            if (isAutoTime) {
                keyStr += `, ${createTime}, ${updateTime}`
                valueStr += ', ?, ?'
                const now = moment().format('YYYY-MM-DD HH:mm:ss')
                this.values.push(now, now)
            }
            this.lastSql = format(`INSERT INTO ${this.tableName} (${keyStr}) VALUES (${valueStr})`, this.values)
            if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
            const [rows] = await this.pool[this.db].execute(this.lastSql)
            return rows || {}
        }
    }

    /**
     * 新增多条数据, 注意数据格式一定要保持一致
     * @param objArray 数据对象集合
     * @param options 设置选项
     * -------@param isAutoTime 是否开启自动时间戳，默认不开启
     * -------@param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * -------@param createTime 创建时间字段名，默认 create_time
     * -------@param updateTime 更新时间字段名，默认 update_time
     */
    async insertAll(objArray: DBOBJECT[] = [], options: { isAutoTime?: boolean; isShowSql?: boolean; createTime?: string; updateTime?: string } = {}) {
        const { isAutoTime, isShowSql, createTime, updateTime } = { isAutoTime: false, isShowSql: false, createTime: getConfig()?.app?.createTime, updateTime: getConfig()?.app?.updateTime, ...options }
        let keyStr = ''
        let valueStr = ''
        objArray.forEach((value, idx) => {
            const len = Object.keys(value).length
            if (len > 0) {
                let oValueStr = ''
                Object.keys(value).forEach((key, index) => {
                    if (idx === 0) keyStr += `${key}${index === len - 1 ? '' : ', '}`
                    oValueStr += `?${index === len - 1 ? '' : ', '}`
                    this.values.push(value[key])
                })
                if (isAutoTime) {
                    if (idx === 0) {
                        keyStr += `, ${createTime}, ${updateTime}`
                    }
                    oValueStr += ', ?, ?'
                    const now = moment().format('YYYY-MM-DD HH:mm:ss')
                    this.values.push(now, now)
                }
                valueStr += `(${oValueStr})${idx === objArray.length - 1 ? '' : ','}`
            }
        })
        if (objArray.length > 0) {
            this.lastSql = format(`INSERT INTO ${this.tableName} (${keyStr}) VALUES ${valueStr}`, this.values)
            if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
            const [rows] = await this.pool[this.db].execute(this.lastSql)
            return rows || {}
        }
    }

    /**
     * 更新数据
     * @param obj 数据对象
     * @param options 设置选项
     * -------@param isAutoTime 是否开启自动时间戳，默认不开启
     * -------@param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * -------@param updateTime 更新时间字段名，默认 update_time
     */
    async update(obj: DBOBJECT = {}, options: { isAutoTime?: boolean; isShowSql?: boolean; updateTime?: string } = {}) {
        const { isAutoTime, isShowSql, updateTime } = { isAutoTime: false, isShowSql: false, updateTime: getConfig()?.app?.updateTime, ...options }
        const len = Object.keys(obj).length
        if (len > 0) {
            let setStr = ''
            let vals = []
            Object.keys(obj).forEach((key, index) => {
                setStr += `${key} = ?${index === len - 1 ? '' : ', '}`
                vals.push(obj[key])
            })
            if (isAutoTime) {
                const now = moment().format('YYYY-MM-DD HH:mm:ss')
                setStr += `, ${updateTime} = ?`
                vals.push(now)
            }
            this.values.unshift(...vals)
            this.lastSql = format(`UPDATE ${this.tableName} SET ${setStr} ${this.whereStr}`, this.values)
            if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
            const [rows] = await this.pool[this.db].execute(this.lastSql)
            return rows || {}
        }
    }

    /**
     * 删除数据
     * @param options 设置选项
     * -------@param isDelete 是否是软删除，默认是 
     * -------@param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * -------@param deleteTime 删除时间字段名，默认 delete_time
     * @returns 
     */
    async delete(options: { isDelete?: boolean; isShowSql?: boolean; deleteTime?: string } = {}) {
        const { isDelete, isShowSql, deleteTime } = { isDelete: true, isShowSql: false, deleteTime: getConfig()?.app?.deleteTime, ...options }
        if (isDelete) {
            const now = moment().format('YYYY-MM-DD HH:mm:ss')
            return await this.update({ [deleteTime]: now }, { isAutoTime: false, isShowSql })
        } else {
            this.lastSql = format(`DELETE FROM ${this.tableName} ${this.whereStr}`, this.values)
            if (!this.lastSql.includes('WHERE')) return
            if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
            const [rows] = await this.pool[this.db].execute(this.lastSql)
            return rows || {}
        }
    }

    /**
     * 查询一条数据
     * @param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * @returns 
     */
    async findOne(isShowSql: boolean = false) {
        this.whereStr += 'LIMIT 1'
        this.lastSql = format(`SELECT ${this.fieldStr} FROM ${this.tableName} ${this.whereStr}`, this.values)
        if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
        const [rows] = await this.pool[this.db].execute(this.lastSql)
        // @ts-ignore
        return rows?.[0] || {}
    }

    /**
     * 查询多条数据
     * @param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * @returns 
     */
    async select(isShowSql: boolean = false) {
        this.lastSql = format(`SELECT ${this.fieldStr} FROM ${this.tableName} ${this.whereStr}`, this.values)
        if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
        const [rows] = await this.pool[this.db].execute(this.lastSql)
        return rows || []
    }

    /**
     * 自定义SQL语句查询
     * @param sql 查询语句，防止注入请用?占位
     * @param values 匹配?的值
     * @param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * @returns 
     */
    async query(sql: string, values: (number | string)[] = [], isShowSql: boolean = false) {
        this.lastSql = format(sql, values)
        if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
        const [rows] = await this.pool[this.db].execute(this.lastSql)
        return rows || []
    }
}