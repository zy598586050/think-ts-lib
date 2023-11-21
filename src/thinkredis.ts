/*
 * @Author: zhangyu
 * @Date: 2023-11-21 14:30:29
 * @LastEditTime: 2023-11-21 18:15:36
 */
import redis from 'ioredis'
import { getConfig } from './config'

interface DBOBJECT {
    [key: string]: any
}

export default class ThinkRedis {

    // 配置
    redisConfig: DBOBJECT
    // 连接
    client?: any
    // 数据源
    db: string

    // 构造函数初始化
    constructor(db: string = '') {
        this.redisConfig = getConfig()?.redis || {}
        Object.keys(this.redisConfig).forEach((key, index) => {
            if (index === 0) db = key
        })
        this.db = db
        this.client = new redis({
            host: this.redisConfig[db].host,
            port: this.redisConfig[db].port,
            db: this.redisConfig[db].db,
            password: this.redisConfig[db].password
        })
    }

    /**
     * 获取值
     * @param key 键
     * @returns 
     */
    get(key: string) {
        return this.client.get(key)
    }

    /**
     * 设置值
     * @param key 键
     * @param value 值
     * @param timeout 过期时间
     * @param callback 过期后的回调
     */
    set(key: string, value: string | DBOBJECT, timeout: number = 0, callback?: () => void) {
        if (callback) {
            this.client.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], () => {
                this.client.subscribe(`__keyevent@${this.redisConfig[this.db].db}__:expired`, () => {
                    this.client.on('message', (_: any, msg: string) => {
                        if (msg === key) callback()
                    })
                })
            })
        }
        this.client.set(key, typeof value === 'object' ? JSON.stringify(value) : value)
        timeout && this.client.expire(key, timeout)
    }

    /**
     * 删除值
     * @param key 键
     */
    del(key: string) {
        this.client.del(key)
    }

    /**
     * 以哈希的方式存储
     * @param index 索引
     * @param value 键值对
     * @param timeout 过期时间
     */
    hmset(index: string, value: DBOBJECT, timeout: number = 0, callback?: () => void) {
        if (callback) {
            this.client.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], () => {
                this.client.subscribe(`__keyevent@${this.redisConfig[this.db].db}__:expired`, () => {
                    this.client.on('message', (_: any, msg: string) => {
                        if (msg === index) callback()
                    })
                })
            })
        }
        this.client.hmset(index, value)
        timeout && this.client.expire(index, timeout)
    }

    /**
     * 获取
     * @param index 索引
     * @param key 键
     * @returns 
     */
    hget(index: string, key: string) {
        return this.client.hget(index, key)
    }

    /**
     * 删除
     * @param index 索引
     * @param key 键
     * @returns 
     */
    hdel(index: string, key: string) {
        this.client.hdel(index, key)
    }

    /**
     * 递减
     * @param key 键
     * @param num 步长
     */
    decrby(key: string, num: number = 1) {
        this.client.decrby(key, num)
    }

    /**
     * 递增
     * @param key 键
     * @param num 步长
     */
    incrby(key: string, num: number = 1) {
        this.client.incrby(key, num)
    }

    /**
     * 将给定的值推入列表的右端
     * @param key 键
     * @param value 值
     */
    rpush(key: string, value: string) {
        this.client.rpush(key, typeof value === 'object' ? JSON.stringify(value) : value)
    }

    /**
     * 从列表右端弹出一个值
     * @param key 键
     * @returns 
     */
    rpop(key: string) {
        return this.client.rpop(key)
    }
}