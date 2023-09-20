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
exports.processFile = void 0;
var template_1 = require("./template");
var path = require("path");
var merge_anything_1 = require("merge-anything");
var logger_1 = require("../logger/logger");
var filesave_1 = require("./filesave");
/**
 *
 * @param filePath 文件路径模板
 * @param params 参数
 * @returns
 */
var varRegex = /\$([ULF])\{(\w+)\}|%\{(\w+)\}/g;
/**
 * 替换变量
 * @param {string} template 模板
 * @param {object} params 参数
 * @returns {string}
 */
function replaceVars(template, params) {
    var regex = /\$([A-Z]{0,1})\{(\w+)\}/g;
    return template.replace(regex, function (match, modifier, variable) {
        var value = params[variable];
        if (value !== undefined) {
            if (modifier === 'U') {
                // 全部大写
                value = value.toUpperCase();
            }
            else if (modifier === 'L') {
                // 全部小写
                value = value.toLowerCase();
            }
            else if (modifier === 'F') {
                // 首字母大写
                value = value.charAt(0).toUpperCase() + value.slice(1);
            }
        }
        else
            return "$" + modifier + "{" + variable + "}";
        return value;
    });
}
/**
 * 调用模板生成文件
 * @param config 文件配置信息
 */
function processFile(yamlBase, key, generator, listItem, newFileMap) {
    generator.forEach(function (generatorFlow) {
        var generatorItem = JSON.parse(JSON.stringify(__assign({}, (0, merge_anything_1.merge)(listItem, generatorFlow))));
        var template = generatorItem.template, output_dir = generatorItem.output_dir, file = generatorItem.file, params = generatorItem.params, restProps = __rest(generatorItem, ["template", "output_dir", "file", "params"]);
        var _a = generatorItem.sub_dir, sub_dir = _a === void 0 ? "" : _a;
        if (!file) {
            logger_1.default.error("Generate ProcessFile 1", "Error processing undefined file", generatorItem);
            return;
        }
        if (!template) {
            logger_1.default.error("Generate ProcessFile 2", "Missing template for file: ", file);
            return;
        }
        if (!output_dir) {
            logger_1.default.error("Generate ProcessFile 3", "Missing output_dir for file: ", file);
            return;
        }
        var templateInfo;
        if (template) {
            /// 文件单独模板优先
            if (typeof template === "string") {
                templateInfo = (0, template_1.getTemplate)(template);
            }
            else {
                templateInfo = template;
            }
        }
        if (!templateInfo) {
            logger_1.default.error("Generate ProcessFile 4", "Error processing undefined template file: ", template);
            return;
        }
        // 子路径单独处理，可能在文件中使用
        sub_dir = replaceVars(sub_dir, restProps);
        sub_dir = replaceVars(sub_dir, params);
        /**
         * 相对路径配置转换
         */
        var outputPath = path.join(output_dir, sub_dir);
        outputPath = replaceVars(outputPath, restProps);
        outputPath = replaceVars(outputPath, params);
        /**
         * 文件名配置转换
         */
        var target_file = replaceVars(file, restProps);
        target_file = replaceVars(target_file, params);
        /**
         * 完整输出路径
         */
        var fullPath = path.join(process.cwd(), outputPath);
        /**
         * 完整输出路径
         */
        restProps.target_full_dir = fullPath;
        /**
         * 完整相对路径
         */
        restProps.target_output_dir = outputPath;
        /**
         * 子路径
         */
        restProps.target_sub_dir = sub_dir;
        /**
         * 文件名
         */
        restProps.target_file = target_file;
        try {
            var tempData = __assign({ params: params }, restProps);
            (0, filesave_1.saveFile)(yamlBase, key, templateInfo, tempData, newFileMap);
        }
        catch (error) {
            logger_1.default.error("Generate ProcessFile 5", "Error saveFile file ".concat(path.join(outputPath, target_file), ": ").concat(error.message));
        }
    });
}
exports.processFile = processFile;
