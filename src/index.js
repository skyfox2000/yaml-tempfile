"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initYaml = void 0;
var yaml = require("js-yaml");
var fs = require("fs");
var template_1 = require("./generator/template");
var file_1 = require("./generator/file");
var path = require("path");
var logger_1 = require("./logger/logger");
/**
 * 运行Yaml模板自动化生成
 * Yaml模板自动化生成文件，批量管理自动化生成文件
 * @param yamlBase 配置根目录，存放template目录和文件指纹
 * @param yamlFilePath Yaml文件路径
 */
function initYaml(yamlBase, yamlFilePath) {
    try {
        // 读取YAML配置文件
        var config = yaml.load(fs.readFileSync(path.join(process.cwd(), yamlFilePath), "utf8"));
        try {
            logger_1.default.level = parseInt(config.logger_level);
        }
        catch (e) {
        }
        // 加载模板配置
        (0, template_1.loadTemplateConfig)(yamlBase, config.template_config);
        // 处理文件配置
        (0, file_1.loadFileConfigs)(yamlBase, config.file_config);
    }
    catch (error) {
        logger_1.default.error("Index initYaml 1", "Error initializing YAML configuration: ".concat(error.message));
        // 在这里可以选择如何处理错误，例如抛出异常或采取其他措施
        throw error;
    }
}
exports.initYaml = initYaml;
/**
 * Vite插件: vite-yaml-tempfile
 * Yaml模板自动化生成文件，批量管理自动化生成文件
 * @param options Vite配置
 * @returns
 */
function viteYamlTempFile(options) {
    try {
        return {
            name: "vite-yaml-tempfile",
            configResolved: function () {
                var _a = options || {}, yamlBase = _a.yamlBase, yamlFile = _a.yamlFile;
                if (!yamlBase)
                    yamlBase = "/yaml-tempfile";
                if (!yamlFile)
                    yamlFile = "config.yaml";
                initYaml(yamlBase, path.join(yamlBase, yamlFile));
            }
        };
    }
    catch (error) {
        // 在这里可以处理初始化过程中的错误
        logger_1.default.error("Index init 1", "Initialization error: ".concat(error.message));
    }
}
exports.default = viteYamlTempFile;
// 如果当前模块是被直接运行的，则执行你的组件的功能
(function () {
    initYaml("/yaml-tempfile", "./yaml-tempfile/config.yaml");
})();
