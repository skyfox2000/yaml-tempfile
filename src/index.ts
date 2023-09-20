import * as yaml from "js-yaml";
import * as fs from "fs";
import { TemplateItem, loadTemplateConfig } from "./generator/template";
import { FileConfig, loadFileConfigs } from "./generator/file";
import * as path from "path";
import logger from "./logger/logger";

interface YamlTempfileOptions {
   /**
    * Yaml配置文件根目录
    * 默认位置为/yaml-template
    * 文件指纹存放位置
    */
   yamlBase: string;
   /**
    * Yaml配置文件名，默认为config.yaml
    */
   yamlFile?: string;
}

interface AppConfig {
   logger_level: string;
   template_config: TemplateItem[];
   file_config: FileConfig;
}

/**
 * 运行Yaml模板自动化生成
 * Yaml模板自动化生成文件，批量管理自动化生成文件
 * @param yamlBase 配置根目录，存放template目录和文件指纹
 * @param yamlFilePath Yaml文件路径
 */
export function initYaml(yamlBase: string, yamlFilePath: string) {
   try {
      // 读取YAML配置文件
      const config: AppConfig = yaml.load(fs.readFileSync(path.join(process.cwd(), yamlFilePath), "utf8")) as AppConfig;

      try {
         logger.level = parseInt(config.logger_level)
      } catch (e) {
      }
      // 加载模板配置
      loadTemplateConfig(yamlBase, config.template_config);

      // 处理文件配置
      loadFileConfigs(yamlBase, config.file_config);
   } catch (error: any) {
      logger.error("Index initYaml 1", `Error initializing YAML configuration: ${error.message}`);
      // 在这里可以选择如何处理错误，例如抛出异常或采取其他措施
      throw error;
   }
}

/**
 * Vite插件: vite-yaml-tempfile
 * Yaml模板自动化生成文件，批量管理自动化生成文件
 * @param options Vite配置
 * @returns 
 */
export default function viteYamlTempFile(options?: YamlTempfileOptions) {
   try {
      return {
         name: "vite-yaml-tempfile",
         configResolved() {
            let { yamlBase, yamlFile } = options || {};
            if (!yamlBase) yamlBase = "/yaml-tempfile";
            if (!yamlFile) yamlFile = "config.yaml";
            initYaml(yamlBase, path.join(yamlBase, yamlFile));
         }
      }
   } catch (error: any) {
      // 在这里可以处理初始化过程中的错误
      logger.error("Index init 1", `Initialization error: ${error.message}`);
   }
}

// 如果当前模块是被直接运行的，则执行你的组件的功能
(function () {
   initYaml("/yaml-tempfile", "./yaml-tempfile/config.yaml");
})();