import alipay from 'alipay-sdk';
import alipayFormData from 'alipay-sdk/lib/form';
import oss from 'ali-oss';
import moment from 'moment';
interface WXPAY {
    appid?: string;
    mchid?: string;
    private_key?: string;
    serial_no?: string;
    apiv3_private_key?: string;
    notify_url?: string;
}
interface ALIPAY {
    appId?: string;
    privateKey?: string;
    encryptKey?: string;
    alipayRootCertPath?: string;
    alipayPublicCertPath?: string;
    appCertPath?: string;
}
interface SMSTYPE {
    accessKeyId?: string;
    secretAccessKey?: string;
}
interface OSSTYPE {
    accessKeyId?: string;
    accessKeySecret?: string;
    region?: string;
    bucket?: string;
}
export declare let Utils: {
    moment: typeof moment;
    firstToUpper(str: string): string;
    orderCode(num?: number): string;
    getNonceStr(num?: number): string;
    sha1(str: string): string;
    rsaSign(content: string, privateKey: string, hash?: string): string;
    raw(args: Record<string, any>): string;
    getIP(): string;
    getValidateCode(num?: number): string;
    MD5(text: string): string;
    createToken(obj?: any, jwt_key?: string, expiresIn?: number): string;
    validateToken(token: string): {};
    WxPay({ appid, mchid, private_key, serial_no, apiv3_private_key, notify_url }?: WXPAY): any;
    AliPay({ appId, privateKey, encryptKey, alipayRootCertPath, alipayPublicCertPath, appCertPath }?: ALIPAY): alipay;
    SMS({ accessKeyId, secretAccessKey }?: SMSTYPE): any;
    OSS({ accessKeyId, accessKeySecret, region, bucket }?: OSSTYPE): oss;
    AlipayFormData(): alipayFormData;
};
export {};
