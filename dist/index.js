"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.View = exports.GetParams = exports.ApiException = exports.ShowSuccess = exports.Controller = exports.appConfig = void 0;
const start_1 = __importDefault(require("./start"));
const config_1 = require("./config");
const controller_1 = require("./controller");
Object.defineProperty(exports, "Controller", { enumerable: true, get: function () { return controller_1.Controller; } });
Object.defineProperty(exports, "ShowSuccess", { enumerable: true, get: function () { return controller_1.ShowSuccess; } });
Object.defineProperty(exports, "ApiException", { enumerable: true, get: function () { return controller_1.ApiException; } });
Object.defineProperty(exports, "GetParams", { enumerable: true, get: function () { return controller_1.GetParams; } });
Object.defineProperty(exports, "View", { enumerable: true, get: function () { return controller_1.View; } });
exports.appConfig = (0, config_1.getConfig)();
exports.default = {
    start: start_1.default,
    appConfig: (0, config_1.getConfig)(),
    Controller: controller_1.Controller,
    ShowSuccess: controller_1.ShowSuccess,
    ApiException: controller_1.ApiException,
    GetParams: controller_1.GetParams,
    View: controller_1.View
};
