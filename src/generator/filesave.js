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
exports.saveFile = exports.removeDeletedFiles = exports.saveFileDataMap = void 0;
var fs = require("fs");
var crypto = require("crypto");
var template_1 = require("./template");
var path = require("path");
var logger_1 = require("../logger/logger");
var mapFiles = new Map();
var getFileHash = function (jsonDataStr) {
    var hash = crypto.createHash('md5').update(jsonDataStr).digest('hex');
    return hash;
};
var loadFileDataMap = function (yamlBase, key) {
    var mapFileName = path.join(process.cwd(), yamlBase, "".concat(key, "_filemap.json"));
    try {
        if (fs.existsSync(mapFileName)) {
            var fileMapData = fs.readFileSync(mapFileName, 'utf8');
            mapFiles[key] = JSON.parse(fileMapData);
        }
        else {
            mapFiles[key] = {};
        }
    }
    catch (error) {
        logger_1.default.error("\u8BFB\u53D6 ".concat(key, "_filemap.json \u6587\u4EF6\u9519\u8BEF\uFF01"));
    }
};
/**
 * 保存新文件
 * @param key 文件类型组
 * @param newFileMap 文件列表
 */
var saveFileDataMap = function (yamlBase, key, newFileMap) {
    var mapFileName = path.join(process.cwd(), yamlBase, "".concat(key, "_filemap.json"));
    mapFiles[key] = newFileMap;
    if (newFileMap && Object.keys(newFileMap).length === 0 && fs.existsSync(mapFileName)) {
        fs.unlinkSync(mapFileName);
    }
    else {
        // 保存文件
        fs.writeFileSync(mapFileName, JSON.stringify(newFileMap, null, 3), 'utf-8');
    }
};
exports.saveFileDataMap = saveFileDataMap;
/**
 * 删除已取消的文件
 * @param key 删除已取消的文件
 * @param newFileMap 文件列表
 */
var removeDeletedFiles = function (yamlBase, key, newFileMap) {
    if (!mapFiles[key]) {
        loadFileDataMap(yamlBase, key);
    }
    var oldFileMap = mapFiles[key];
    logger_1.default.debug("\u5220\u9664 ".concat(key, " \u6587\u4EF6\u5217\u8868"));
    for (var filePath in oldFileMap) {
        if (!newFileMap[filePath]) {
            var fullFilePath = path.join(process.cwd(), filePath);
            logger_1.default.debug("\u5220\u9664 ".concat(filePath, " \u6587\u4EF6"));
            logger_1.default.trace("\u5220\u9664 ".concat(fullFilePath, " \u6587\u4EF6"));
            if (fs.existsSync(fullFilePath)) {
                fs.unlinkSync(fullFilePath);
            }
        }
    }
};
exports.removeDeletedFiles = removeDeletedFiles;
var saveFile = function (yamlBase, key, templateInfo, tempData, newFileMap) {
    var skip = tempData.skip, test = tempData.test, restData = __rest(tempData, ["skip", "test"]);
    var fullPath = restData.target_full_dir;
    var fileName = restData.target_file;
    var filePath = path.join(restData.target_output_dir, fileName);
    var fullFilePath = path.join(fullPath, fileName);
    var hash = getFileHash(JSON.stringify(restData));
    newFileMap[filePath] = hash;
    if (skip) {
        logger_1.default.warn("忽略文件" + path.join(restData.target_sub_dir, restData.target_file) + "！");
        return;
    }
    if (!mapFiles[key]) {
        loadFileDataMap(yamlBase, key);
    }
    var oldFileMap = mapFiles[key];
    logger_1.default.debug("tempData对象内容: ", __assign({}, restData));
    var rendered = (0, template_1.generateTemplate)(templateInfo, { tempData: __assign({}, restData) });
    if (tempData.test) {
        logger_1.default.debug("测试文件路径与文件名: ", filePath);
        logger_1.default.info("文件测试输出结果: ", rendered.trim(), "\n");
    }
    else if (oldFileMap[filePath] !== hash || !fs.existsSync(fullFilePath)) {
        if (restData.overwrite === false) {
            logger_1.default.warn("文件" + filePath + "禁止覆盖！");
        }
        else {
            /// 如果目录不存在，创建目录
            if (!fs.existsSync(fullPath))
                fs.mkdirSync(fullPath, { recursive: true });
            fs.writeFileSync(fullFilePath, rendered.trim(), "utf8");
            logger_1.default.log("生成文件" + filePath + "完成！");
        }
    }
    else {
        logger_1.default.info("文件" + filePath + "文件指纹相同！");
    }
};
exports.saveFile = saveFile;
