/*
 * @Author: zhangyu
 * @Date: 2023-11-15 10:45:17
 * @LastEditTime: 2023-11-21 14:05:29
 */
import { createPool, Pool, format, PoolConnection } from 'mysql2/promise'
import { getConfig } from './config'
import Log4j from './log4j'
import moment from 'moment'

type CONDITION = '=' | '!=' | '>' | '<' | '>=' | '<=' | '<>'
type SORT = 'DESC' | 'ASC'
type JOIN = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL'
interface DBOBJECT {
    [key: string]: any
}

export default class ThinkDb {

    // 数据库配置
    mysqlConfig: DBOBJECT
    // 连接池
    pool: Pool
    // 连接
    connection?: PoolConnection
    // 表名称
    tableName: string = ''
    // 查询的字段
    fieldStr: string = '*'
    // 条件
    whereStr: string = ''
    // 值的集合
    values: (string | number | (string | number)[])[] = []
    // 连表查询
    joinStr: string = ''
    // 锁
    lockStr: string = ''
    // 最后执行的查询语句
    lastSql: string = ''

    // 构造函数初始化
    constructor(tableName: string = '', db: string = '') {
        this.tableName = tableName
        this.mysqlConfig = getConfig()?.mysql || {}
        Object.keys(this.mysqlConfig).forEach((key, index) => {
            if (index === 0) db = key
        })
        this.pool = createPool({
            host: this.mysqlConfig[db].host,
            port: this.mysqlConfig[db].port,
            user: this.mysqlConfig[db].user,
            password: this.mysqlConfig[db].password,
            database: this.mysqlConfig[db].database,
            connectionLimit: this.mysqlConfig[db].connectionLimit
        })
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
            const [rows] = await (this.connection || this.pool)?.execute(this.lastSql)
            this.connection?.release()
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
            const [rows] = await (this.connection || this.pool)?.execute(this.lastSql)
            this.connection?.release()
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
     * -------@param allProtect 全量更新保护，默认开启，防止忘记写WHERE条件误更新所有数据
     */
    async update(obj: DBOBJECT = {}, options: { isAutoTime?: boolean; isShowSql?: boolean; updateTime?: string; allProtect?: boolean } = {}) {
        const { isAutoTime, isShowSql, updateTime, allProtect } = { isAutoTime: false, isShowSql: false, updateTime: getConfig()?.app?.updateTime, allProtect: true, ...options }
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
            if (allProtect && !this.lastSql.includes('WHERE')) {
                Log4j('警告：是否忘记增加WHERE条件，如果需要全量更新，请关闭全量更新保护', 'warn')
                return
            }
            if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
            const [rows] = await (this.connection || this.pool)?.execute(this.lastSql)
            this.connection?.release()
            return rows || {}
        }
    }

    /**
     * 删除数据
     * @param options 设置选项
     * -------@param isDeleteFlag 是否是软删除，默认是 
     * -------@param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * -------@param deleteTime 删除时间字段名，默认 delete_time
     * -------@param deleteProtect 删除保护，默认开启，防止忘记写WHERE条件误删除所有数据，只争对物理删除有效
     * @returns 
     */
    async delete(options: { isDeleteFlag?: boolean; isShowSql?: boolean; deleteTime?: string; deleteProtect?: boolean } = {}) {
        const { isDeleteFlag, isShowSql, deleteTime, deleteProtect } = { isDeleteFlag: true, isShowSql: false, deleteTime: getConfig()?.app?.deleteTime, deleteProtect: true, ...options }
        if (isDeleteFlag) {
            const now = moment().format('YYYY-MM-DD HH:mm:ss')
            return await this.update({ [deleteTime]: now }, { isAutoTime: false, isShowSql })
        } else {
            this.lastSql = format(`DELETE FROM ${this.tableName} ${this.whereStr}`, this.values)
            if (deleteProtect && !this.lastSql.includes('WHERE')) {
                Log4j('警告：是否忘记增加WHERE条件，如果需要删除全部，请关闭删除保护', 'warn')
                return
            }
            if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
            const [rows] = await (this.connection || this.pool)?.execute(this.lastSql)
            this.connection?.release()
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
        this.lastSql = format(`SELECT ${this.fieldStr} FROM ${this.tableName} ${this.whereStr} ${this.lockStr}`, this.values)
        if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
        const [rows] = await (this.connection || this.pool)?.execute(this.lastSql)
        this.connection?.release()
        // @ts-ignore
        return rows?.[0] || {}
    }

    /**
     * 查询数据的数量
     * @param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * @returns 
     */
    async count(isShowSql: boolean = false) {
        this.lastSql = format(`SELECT COUNT(*) AS COUNT FROM ${this.tableName} ${this.whereStr} ${this.lockStr}`, this.values)
        if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
        const [rows] = await (this.connection || this.pool)?.execute(this.lastSql)
        this.connection?.release()
        // @ts-ignore
        return rows?.[0]?.COUNT || 0
    }

    /**
     * 以某个字段递减
     * @param field 字段名
     * @param num 步减 默认步减为1
     * @options 设置选项
     * ---------@param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * ---------@param allProtect 全量更新保护，默认开启，防止忘记写WHERE条件误更新所有数据
     */
    async decr(field: string, num: number = 1, options: { isShowSql?: boolean; allProtect?: boolean }) {
        const { isShowSql, allProtect } = { isShowSql: false, allProtect: true, ...options }
        const setStr = `${field} = ${field} - ${num}`
        this.lastSql = format(`UPDATE ${this.tableName} SET ${setStr} ${this.whereStr}`, this.values)
        if (allProtect && !this.lastSql.includes('WHERE')) {
            Log4j('警告：是否忘记增加WHERE条件，如果需要全量更新，请关闭全量更新保护', 'warn')
            return
        }
        if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
        const [rows] = await (this.connection || this.pool)?.execute(this.lastSql)
        this.connection?.release()
        // @ts-ignore
        return rows?.[0] || {}
    }

    /**
     * 以某个字段递增
     * @param field 字段名
     * @param num 步增 默认步增为1
     * @options 设置选项
     * ---------@param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * ---------@param allProtect 全量更新保护，默认开启，防止忘记写WHERE条件误更新所有数据
     */
    async incr(field: string, num: number = 1, options: { isShowSql?: boolean; allProtect?: boolean }) {
        const { isShowSql, allProtect } = { isShowSql: false, allProtect: true, ...options }
        const setStr = `${field} = ${field} + ${num}`
        this.lastSql = format(`UPDATE ${this.tableName} SET ${setStr} ${this.whereStr}`, this.values)
        if (allProtect && !this.lastSql.includes('WHERE')) {
            Log4j('警告：是否忘记增加WHERE条件，如果需要全量更新，请关闭全量更新保护', 'warn')
            return
        }
        if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
        const [rows] = await (this.connection || this.pool)?.execute(this.lastSql)
        this.connection?.release()
        // @ts-ignore
        return rows?.[0] || {}
    }

    /**
     * 查询多条数据
     * @param isShowSql 是否打印最终执行的SQL语句，默认不打印
     * @returns 
     */
    async select(isShowSql: boolean = false) {
        this.lastSql = format(`SELECT ${this.fieldStr} FROM ${this.tableName}${this.joinStr} ${this.whereStr} ${this.lockStr}`, this.values)
        if (getConfig()?.app?.sqlDebug || isShowSql) console.log(`SQL: ${this.lastSql}`)
        const [rows] = await (this.connection || this.pool)?.execute(this.lastSql)
        this.connection?.release()
        return rows || []
    }

    /**
     * 关联查询
     * @param tableName 关联的表名
     * @param whereStr 关联条件
     * @param type 关联类型 可以为 INNER, LEFT, RIGHT, FULL 默认为LEFT
     * INNER: 如果表中有至少一个匹配，则返回行
     * LEFT: 即使右表中没有匹配，也从左表返回所有的行
     * RIGHT: 即使左表中没有匹配，也从右表返回所有的行
     * FULL: 只要其中一个表中存在匹配，就返回行
     * @returns 
     */
    join(tableName: string, whereStr: string, type: JOIN = 'LEFT') {
        this.joinStr += ` ${type} JOIN ${tableName} ON ${whereStr}`
        return this
    }

    /**
     * 锁
     * @param lockStr 锁类型，默认FOR UPDATE
     * 排它锁 FOR UPDATE
     * 共享锁 LOCK IN SHARE MODE
     * @returns 
     */
    lock(lockStr: string = 'FOR UPDATE') {
        this.lockStr = lockStr
        return this
    }

    /**
     * 传递事务的连接对象
     * @param connection 事务连接对象
     * @returns 
     */
    T(connection: PoolConnection) {
        this.connection = connection
        return this
    }

    /**
     * 事务
     * @param fn 回调函数
     */
    async beginTransaction(fn: (connection: PoolConnection) => Promise<void>) {
        try {
            this.connection = await this.pool.getConnection()
            this.connection.beginTransaction()
            await fn(this.connection)
            await this.connection.commit()
        } catch (error) {
            console.log('事务回滚', error)
            await this.connection?.rollback()
        } finally {
            this.connection?.release()
        }
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
        const [rows] = await (this.connection || this.pool)?.execute(this.lastSql)
        this.connection?.release()
        return rows || []
    }
}