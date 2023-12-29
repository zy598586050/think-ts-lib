"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = void 0;
/*
 * @Author: zhangyu
 * @Date: 2023-11-14 12:29:10
 * @LastEditTime: 2023-12-29 11:26:13
 */
const fs_1 = __importDefault(require("fs"));
const ip_1 = __importDefault(require("ip"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const wxpay_v3_1 = __importDefault(require("wxpay-v3"));
const alipay_sdk_1 = __importDefault(require("alipay-sdk"));
const form_1 = __importDefault(require("alipay-sdk/lib/form"));
const sms_sdk_1 = __importDefault(require("@alicloud/sms-sdk"));
const ali_oss_1 = __importDefault(require("ali-oss"));
const lodash_1 = require("lodash");
const config_1 = require("./config");
const errorcode_1 = require("./errorcode");
const exception_1 = require("./exception");
const jsrsasign_1 = require("jsrsasign");
const moment_1 = __importDefault(require("moment"));
// 常用工具函数
exports.Utils = {
    // 时间处理
    moment: moment_1.default,
    // 首字母大写
    firstToUpper(str) {
        return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
    },
    // 生成订单号
    orderCode(num = 6) {
        let orderCode = '';
        for (let i = 0; i < num; i++) {
            orderCode += Math.floor(Math.random() * 10);
        }
        orderCode = new Date().getTime() + orderCode;
        return orderCode;
    },
    // 生成指定长度的随机数
    getNonceStr(num = 6) {
        let str = '';
        while (str.length < num) {
            str += Math.random().toString(36).slice(2);
        }
        return str.slice(-num);
    },
    // sha1加密
    sha1(str) {
        let shasum = crypto_1.default.createHash('sha1');
        shasum.update(str);
        str = shasum.digest('hex');
        return str;
    },
    // RSA加密
    rsaSign(content, privateKey, hash = 'SHA256withRSA') {
        const rsaKey = jsrsasign_1.KEYUTIL.getKey(privateKey);
        // 创建 Signature 对象
        const signature = new jsrsasign_1.KJUR.crypto.Signature({
            alg: hash
        });
        signature.init(rsaKey);
        signature.updateString(content);
        const signData = signature.sign();
        // 将内容转成base64
        return (0, jsrsasign_1.hextob64)(signData);
    },
    // 对参数对象进行字典排序
    raw(args) {
        let keys = Object.keys(args);
        keys = keys.sort();
        let newArgs = {};
        keys.forEach((key) => {
            newArgs[key.toLowerCase()] = args[key];
        });
        let str = '';
        for (let k in newArgs) {
            str += '&' + k + '=' + newArgs[k];
        }
        str = str.substr(1);
        return str;
    },
    // 获取IP地址
    getIP() {
        return ip_1.default.address();
    },
    // 生成手机验证码
    getValidateCode(num = 6) {
        let number = '';
        for (let i = 0; i < num; i++) {
            number += Math.floor(Math.random() * 10);
        }
        return number;
    },
    // MD5加密
    MD5(text) {
        const hash = crypto_1.default.createHash('md5');
        hash.update(text);
        return hash.digest('hex');
    },
    // 生成JWT TOKEN
    createToken(obj = {}, jwt_key = (0, config_1.getConfig)().app.jwt_key, expiresIn = (0, config_1.getConfig)().app.expiresIn) {
        return jsonwebtoken_1.default.sign(obj, jwt_key, { expiresIn });
    },
    // 校验并解析JWT TOKEN
    validateToken(token) {
        let obj = {};
        if (!token) {
            throw new exception_1.HttpException({
                msg: '非法请求或Token过期',
                errorCode: errorcode_1.ErrorCode.ERROR_TOKEN,
                statusCode: 400
            });
        }
        try {
            obj = jsonwebtoken_1.default.verify(token, (0, config_1.getConfig)().app.jwt_key);
        }
        catch (error) {
            throw new exception_1.HttpException({
                msg: '非法请求或Token过期',
                errorCode: errorcode_1.ErrorCode.ERROR_TOKEN,
                statusCode: 400
            });
        }
        return obj;
    },
    // 微信支付
    WxPay({ appid, mchid, private_key, serial_no, apiv3_private_key, notify_url } = {}) {
        return new wxpay_v3_1.default({
            appid: appid ?? (0, config_1.getConfig)()?.wechat?.appid,
            mchid: mchid ?? (0, config_1.getConfig)()?.wxpay?.mchid,
            private_key: private_key ?? (0, config_1.getConfig)()?.wxpay?.private_key,
            serial_no: serial_no ?? (0, config_1.getConfig)()?.wxpay?.serial_no,
            apiv3_private_key: apiv3_private_key ?? (0, config_1.getConfig)()?.wxpay?.apiv3_private_key,
            notify_url: notify_url ?? (0, config_1.getConfig)()?.wxpay?.notify_url
        });
    },
    // 支付宝支付
    AliPay({ appId, privateKey, encryptKey, alipayRootCertPath, alipayPublicCertPath, appCertPath } = {}) {
        return new alipay_sdk_1.default({
            appId: appId ?? (0, config_1.getConfig)()?.alipay?.appId,
            privateKey: privateKey ?? (0, config_1.getConfig)()?.alipay?.privateKey,
            encryptKey: encryptKey ?? (0, config_1.getConfig)()?.alipay?.encryptKey,
            alipayRootCertPath: alipayRootCertPath ?? (0, config_1.getConfig)()?.alipay?.alipayRootCertPath,
            alipayPublicCertPath: alipayPublicCertPath ?? (0, config_1.getConfig)()?.alipay?.alipayPublicCertPath,
            appCertPath: appCertPath ?? (0, config_1.getConfig)()?.alipay?.appCertPath
        });
    },
    // 阿里短信验证码下发业务
    SMS({ accessKeyId, secretAccessKey } = {}) {
        return new sms_sdk_1.default({
            accessKeyId: accessKeyId ?? (0, config_1.getConfig)()?.alicloud?.accessKeyId,
            secretAccessKey: secretAccessKey ?? (0, config_1.getConfig)()?.alicloud?.secretAccessKey
        });
    },
    // 阿里OSS
    OSS({ accessKeyId, accessKeySecret, region, bucket } = {}) {
        return new ali_oss_1.default({
            accessKeyId: accessKeyId ?? (0, config_1.getConfig)()?.alicloud?.accessKeyId,
            accessKeySecret: accessKeySecret ?? (0, config_1.getConfig)()?.alicloud?.secretAccessKey,
            region: region ?? (0, config_1.getConfig)()?.alicloud?.region,
            bucket: bucket ?? (0, config_1.getConfig)()?.alicloud?.bucket
        });
    },
    // 阿里支付Form表单
    AlipayFormData() {
        return new form_1.default();
    }
};
// 加载扩展工具函数
const utilsDir = path_1.default.resolve(process.cwd(), (0, config_1.getConfig)().app.utils_path);
const loadUtils = (utilsDir) => {
    // 只有存在该目录才会去合并
    if (fs_1.default.existsSync(utilsDir) && fs_1.default.statSync(utilsDir).isDirectory()) {
        fs_1.default.readdirSync(utilsDir).forEach((file) => {
            const modulePath = path_1.default.join(utilsDir, file);
            if (fs_1.default.statSync(modulePath).isDirectory()) {
                loadUtils(modulePath);
            }
            else if (file.endsWith('.ts')) {
                Promise.resolve(`${modulePath}`).then(s => __importStar(require(s))).then((module) => {
                    if (module && module.default) {
                        exports.Utils = (0, lodash_1.merge)(exports.Utils, module.default);
                    }
                }).catch((error) => {
                    console.log(error);
                    throw new exception_1.HttpException({
                        msg: 'Utils工具错误',
                        errorCode: errorcode_1.ErrorCode.ERROR_UTILS,
                        statusCode: 500
                    });
                });
            }
        });
    }
};
loadUtils(utilsDir);
