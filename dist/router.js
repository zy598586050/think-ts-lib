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
const koa_router_1 = __importDefault(require("koa-router"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = require("./config");
const router = new koa_router_1.default();
const route = {
    // GET路由
    get(url, str, middleware) {
        router.get(url, async (ctx) => { });
    }
};
// 加载路由配置
const routeDir = path.resolve(process.cwd(), (0, config_1.getConfig)().app.route_path);
// 只有存在该目录才会去合并
if (fs.existsSync(routeDir) && fs.statSync(routeDir).isDirectory()) {
    fs.readdirSync(routeDir).forEach((file) => {
        // 必须为ts文件并且导出了内容
        if (file.endsWith('.ts')) {
            const modulePath = path.join(routeDir, file);
            const moduleContent = require(modulePath);
            if (moduleContent && moduleContent.default) {
                moduleContent.default(route);
            }
        }
    });
}
exports.default = router;
