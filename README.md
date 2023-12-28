<p align="center">
  <img width="300px" src="https://www.think-js.cn/icon.png">
</p>

<p align="center">
  <a href="https://www.think-ts.cn">
    <img src="https://img.shields.io/badge/npm-v1.0.0-blue">
  </a>
  <a href="https://www.think-ts.cn">
    <img src="https://img.shields.io/badge/downloads-110k/month-green">
  </a>
  <a href="https://www.think-ts.cn">
    <img src="https://codecov.io/gh/element-plus/element-plus/branch/dev/graph/badge.svg?token=BKSBO2GLZI"/>
  </a>
  <br>
</p>

<p align="center">一个企业级的NodeJS应用框架</p>

- 💪 ORM思想用对象的方式CRUD
- 🔥 应用级提炼封装更贴近业务场景

## think-ts-lib

[think-ts-lib](https://www.npmjs.com/package/think-ts-lib) 是 [ThinkTS框架](https://www.thinkts.cn) 的核心依赖。之所以将核心功能拆分成单独的依赖包，是为了避免核心包版本迭代过程中影响 ThinkTS 框架层的业务逻辑。如果想使用 think-ts-lib 升级后的新功能，只需要修改 ThinkTS框架中 ``package.json`` 里 ``think-ts-lib`` 的版本，重新 ``install`` 即可。

## 目录结构

```
.
├── dist                         // 依赖目录
│   ├── config.js                // 全局配置文件
│   ├── controller.js            // 控制器
│   ├── elasticsearch.js         // ES封装
│   ├── error.js                 // 全局异常处理
│   ├── errorcode.js             // 状态码枚举
│   ├── exception.js             // 重写异常处理
│   ├── log4j.js                 // 日志输出
│   ├── index.js                 // 入口文件
│   ├── mongodb.js               // mongodb封装
│   ├── router.js                // 路由实现
│   ├── start.js                 // 初始化文件
│   ├── thinkdb.js               // mysql封装
│   ├── thinkredis.js            // redis封装
│   ├── utils.js                 // 常用工具函数
│   ├── validate.js              // 参数验证器
│   └── view.js                  // 视图处理
├── package.json                 // 配置文件
├── tsconfig.json                // TS配置文件
└── README.md                    // 项目介绍
```

## 更新

可以卸载旧版重新安装

```
npm uninstall think-ts-lib

npm install think-ts-lib
```

或者修改 package.json 里版本号安装

```
"think-ts-lib": "^1.2.3"

npm install

```

> 注意：例如，^1.2.3 表示安装 1.x.x 版本中最新的 1.2.x 版本，不包括 2.x.x 版本。

## 常用功能

* ``Utils`` &ensp; // 常用工具函数调用，注意这是一个属性
* ``Utils.createToken()`` &ensp; // 生成JWT TOKEN
* ``Utils.validateToken()`` &ensp; // 验证JWT TOKEN是否正确
* ``GetParams()`` &ensp; // 获取GET POST传参，同时可校验参数
* ``ShowSuccess()`` &ensp; // 返回JSON格式数据
* ``ApiException()`` &ensp; // 返回一个异常
* ``Db()`` &ensp; // 使用MySql数据库
* ``RDb()`` &ensp; // 使用Redis
* ``EDb()`` &ensp; // 使用ElasticSearch
* ``MDb()`` &ensp; // 使用MongoDB
* ``M()`` &ensp; // 使用模型
* ``Log4j()`` &ensp; // 使用日志处理
* ``Utils.WxPay()`` &ensp; // 使用微信支付
* ``Utils.AliPay()`` &ensp; // 使用支付宝支付
* ``Utils.SMS()`` &ensp; // 使用阿里短信服务
* ``Utils.OSS()`` &ensp; // 使用阿里对象存储

## 执照

ThinkTS已申请软件著作，可在中国版权保护中心中查看
[CPCC](https://www.ccopyright.com.cn).