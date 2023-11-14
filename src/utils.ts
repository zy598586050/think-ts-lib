/*
 * @Author: zhangyu
 * @Date: 2023-11-14 12:29:10
 * @LastEditTime: 2023-11-14 20:49:04
 */
import fs from 'fs'
import ip from 'ip'
import path from 'path'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import wxpay from 'wxpay-v3'
import alipay from 'alipay-sdk'
import sms from '@alicloud/sms-sdk'
import oss from 'ali-oss'
import { merge } from 'lodash'
import { getConfig } from './config'
import { ErrorCode } from './errorcode'
import { HttpException } from './exception'
import { KJUR, hextob64, KEYUTIL } from 'jsrsasign'

interface WXPAY {
    appid?: string
    mchid?: string
    private_key?: string
    serial_no?: string
    apiv3_private_key?: string
    notify_url?: string
}

interface ALIPAY {
    appId?: string
    privateKey?: string
    encryptKey?: string
    alipayRootCertPath?: string
    alipayPublicCertPath?: string
    appCertPath?: string
}

interface SMSTYPE {
    accessKeyId?: string
    secretAccessKey?: string
}

interface OSSTYPE {
    accessKeyId?: string
    accessKeySecret?: string
    region?: string
    bucket?: string
}

// 常用工具函数
export let Utils = {
    // 首字母大写
    firstToUpper(str: string) {
        return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase())
    },
    // 生成订单号
    orderCode(num: number = 6) {
        let orderCode = ''
        for (let i = 0; i < num; i++) {
            orderCode += Math.floor(Math.random() * 10)
        }
        orderCode = new Date().getTime() + orderCode
        return orderCode
    },
    // 生成指定长度的随机数
    getNonceStr(num: number = 6) {
        let str = ''
        while (str.length < num) {
            str += Math.random().toString(36).slice(2)
        }
        return str.slice(-num)
    },
    // sha1加密
    sha1(str: string) {
        let shasum = crypto.createHash('sha1')
        shasum.update(str)
        str = shasum.digest('hex')
        return str
    },
    // RSA加密
    rsaSign(content: string, privateKey: string, hash: string = 'SHA256withRSA') {
        const rsaKey = KEYUTIL.getKey(privateKey)
        // 创建 Signature 对象
        const signature = new KJUR.crypto.Signature({
            alg: hash
        })
        signature.init(rsaKey)
        signature.updateString(content)
        const signData = signature.sign()
        // 将内容转成base64
        return hextob64(signData)
    },
    // 对参数对象进行字典排序
    raw(args: Record<string, any>) {
        let keys = Object.keys(args)
        keys = keys.sort()
        let newArgs: Record<string, any> = {}
        keys.forEach((key) => {
            newArgs[key.toLowerCase()] = args[key]
        })
        let str = ''
        for (let k in newArgs) {
            str += '&' + k + '=' + newArgs[k]
        }
        str = str.substr(1)
        return str
    },
    // 获取IP地址
    getIP() {
        return ip.address()
    },
    // 生成手机验证码
    getValidateCode(num: number = 6) {
        let number = ''
        for(let i = 0;i < num;i++){
            number += Math.floor(Math.random() * 10)
        }
        return number
    },
    // MD5加密
    MD5(text: string) {
        const hash = crypto.createHash('md5')
        hash.update(text)
        return hash.digest('hex')
    },
    // 生成JWT TOKEN
    createToken(obj: any = {}, jwt_key: string = getConfig().app.jwt_key, expiresIn: number = getConfig().app.expiresIn) {
        return jwt.sign(obj, jwt_key, { expiresIn })
    },
    // 校验并解析JWT TOKEN
    validateToken(token: string) {
        let obj = {}
        if (!token) {
            throw new HttpException({
                msg: '非法请求或Token过期',
                errorCode: ErrorCode.ERROR_TOKEN,
                statusCode: 400
            })
        }
        try {
            obj = jwt.verify(token, getConfig().app.jwt_key)
        } catch (error) {
            throw new HttpException({
                msg: '非法请求或Token过期',
                errorCode: ErrorCode.ERROR_TOKEN,
                statusCode: 400
            })
        }
        return obj
    },
    // 微信支付
    WxPay({ appid, mchid, private_key, serial_no, apiv3_private_key, notify_url }: WXPAY = {}) {
        return new wxpay({
            appid: appid ?? getConfig()?.wechat?.appid,
            mchid: mchid ?? getConfig()?.wxpay?.mchid,
            private_key: private_key ?? getConfig()?.wxpay?.private_key,
            serial_no: serial_no ?? getConfig()?.wxpay?.serial_no,
            apiv3_private_key: apiv3_private_key ?? getConfig()?.wxpay?.apiv3_private_key,
            notify_url: notify_url ?? getConfig()?.wxpay?.notify_url
        })
    },
    // 支付宝支付
    AliPay({ appId, privateKey, encryptKey, alipayRootCertPath, alipayPublicCertPath, appCertPath }: ALIPAY = {}) {
        return new alipay({
            appId: appId ?? getConfig()?.alipay?.appId,
            privateKey: privateKey ?? getConfig()?.alipay?.privateKey,
            encryptKey: encryptKey ?? getConfig()?.alipay?.encryptKey,
            alipayRootCertPath: alipayRootCertPath ?? getConfig()?.alipay?.alipayRootCertPath,
            alipayPublicCertPath: alipayPublicCertPath ?? getConfig()?.alipay?.alipayPublicCertPath,
            appCertPath: appCertPath ?? getConfig()?.alipay?.appCertPath
        })
    },
    // 阿里短信验证码下发业务
    SMS({ accessKeyId, secretAccessKey }: SMSTYPE = {}) {
        return new sms({
            accessKeyId: accessKeyId ?? getConfig()?.alicloud?.accessKeyId,
            secretAccessKey: secretAccessKey ?? getConfig()?.alicloud?.secretAccessKey
        })
    },
    // 阿里OSS
    OSS({ accessKeyId, accessKeySecret, region, bucket }: OSSTYPE = {}) {
        return new oss({
            accessKeyId: accessKeyId ?? getConfig()?.alicloud?.accessKeyId,
            accessKeySecret: accessKeySecret ?? getConfig()?.alicloud?.secretAccessKey,
            region: region ?? getConfig()?.alicloud?.region,
            bucket: bucket ?? getConfig()?.alicloud?.bucket
        })
    }
}

// 加载扩展工具函数
const utilsDir = path.resolve(process.cwd(), getConfig().app.utils_path)
const loadUtils = (utilsDir: string) => {
    // 只有存在该目录才会去合并
    if (fs.existsSync(utilsDir) && fs.statSync(utilsDir).isDirectory()) {
        fs.readdirSync(utilsDir).forEach((file) => {
            const modulePath = path.join(utilsDir, file)
            if (fs.statSync(modulePath).isDirectory()) {
                loadUtils(modulePath)
            } else if (file.endsWith('.ts')) {
                import(modulePath).then((module) => {
                    if (module && module.default) {
                        Utils = merge(Utils, module.default)
                    }
                }).catch((error) => {
                    console.log(error)
                    throw new HttpException({
                        msg: 'Utils工具错误',
                        errorCode: ErrorCode.ERROR_UTILS,
                        statusCode: 500
                    })
                })
            }
        })
    }
}
loadUtils(utilsDir)