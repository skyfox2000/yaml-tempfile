"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTemplate = exports.getTemplate = exports.loadTemplateConfig = void 0;
var fs = require("fs");
var path = require("path");
var logger_1 = require("../logger/logger");
/**
 * 配置根目录，存放template目录和文件指纹
 */
var YAML_BASE = "";
var templateMap = new Map();
// 模板引擎缓存
var templateEngineCache = {};
function loadTemplateConfig(yamlBase, configs) {
    YAML_BASE = yamlBase;
    configs.forEach(function (config) {
        templateMap.set(config.name, config);
    });
}
exports.loadTemplateConfig = loadTemplateConfig;
// 在 template.ts 中
function getTemplate(name) {
    if (typeof name === "string") {
        // 如果是字符串,判断是否为路径
        if (name.includes(".")) {
            // 如果有扩展名,转为模板配置
            return {
                name: name,
                file: name
            };
        }
        else {
            // 如果是模板名,从映射中获取
            return templateMap.get(name);
        }
    }
    else {
        // 如果本身就是模板配置,直接返回
        return name;
    }
}
exports.getTemplate = getTemplate;
function generateTemplate(template, data) {
    try {
        var templateContent = fs.readFileSync(path.join(process.cwd(), YAML_BASE, template.file), "utf8");
        var templateEngine = null;
        if (template.engine) {
            // 如果配置了引擎,检查缓存
            if (!templateEngineCache[template.engine]) {
                // 缓存中不存在,加载模块
                templateEngineCache[template.engine] = require(template.engine);
            }
            templateEngine = templateEngineCache[template.engine];
        }
        else {
            // 默认 ejs
            templateEngine = require("ejs");
        }
        if (!templateEngine) {
            logger_1.default.error("Template generateTemplate 2", "Error generating template (".concat(template.name, "): unknow engine ").concat(template.engine));
            return;
        }
        var rendered = templateEngine.render(templateContent, data);
        return rendered;
    }
    catch (error) {
        logger_1.default.error("Template generateTemplate 1", "Error generating template (".concat(template.name, "): ").concat(error.message));
        throw error;
    }
}
exports.generateTemplate = generateTemplate;
