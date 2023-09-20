"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFileConfigs = exports.getFileFingerprint = void 0;
var crypto = require("crypto");
var merge_anything_1 = require("merge-anything");
var logger_1 = require("../logger/logger");
var generator_1 = require("./generator");
var filesave_1 = require("./filesave");
/**
 * 配置根目录，存放template目录和文件指纹
 */
var YAML_BASE = "";
/**
 * 模板引擎缓存
 */
var transformerEngineCache = {};
/**
 * 文件配置指纹缓存
 */
var fileFingerprints = new Map();
/**
 * 获取文件配置指纹
 * @param config 文件配置信息
 * @returns 文件指纹
 */
function getFileFingerprint(config) {
    var content = JSON.stringify(config);
    return crypto.createHash("md5")
        .update(content)
        .digest("hex");
}
exports.getFileFingerprint = getFileFingerprint;
/**
 * 加载文件配置信息
 * @param configs 文件配置信息
 */
function loadFileConfigs(yamlBase, configs) {
    YAML_BASE = yamlBase;
    var _loop_1 = function (key) {
        var fileInfo = configs[key];
        if (fileInfo.skip)
            return "continue";
        var list = fileInfo.list, generator = fileInfo.generator, params = fileInfo.params, otherProps = __rest(fileInfo, ["list", "generator", "params"]);
        if (!generator || !generator.length) {
            logger_1.default.error("File loadFileConfigs 1", "Missing generator configuration for file: ", fileInfo);
            return "continue";
        }
        // 包装 params 为对象，如果不存在则使用 fileInfo 作为默认值
        var wrappedParams = __assign(__assign({}, otherProps), { params: params });
        var listItems = (list
            ? list.map(function (data) { return (__assign({}, (0, merge_anything_1.merge)(wrappedParams, data))); })
            : [wrappedParams]);
        var newFileMap = {};
        listItems.forEach(function (listItem) {
            (0, generator_1.processFile)(yamlBase, key, generator, listItem, newFileMap);
        });
        (0, filesave_1.removeDeletedFiles)(YAML_BASE, key, newFileMap);
        (0, filesave_1.saveFileDataMap)(YAML_BASE, key, newFileMap);
    };
    for (var key in configs) {
        _loop_1(key);
    }
}
exports.loadFileConfigs = loadFileConfigs;
