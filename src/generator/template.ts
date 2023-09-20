import * as fs from "fs";
import * as path from "path";
import logger from "../logger/logger";

/**
 * 配置根目录，存放template目录和文件指纹
 */
let YAML_BASE = "";

/**
 * 模板配置项
 */
interface TemplateItem {
   name: string;
   file: string;
   engine?: string;
   output_dir?: string;
}
export { TemplateItem };

const templateMap = new Map<string, TemplateItem>();

// 模板引擎缓存
const templateEngineCache: {
   [key: string]: any
} = {};

export function loadTemplateConfig(yamlBase: string, configs: TemplateItem[]) {
   YAML_BASE = yamlBase;
   configs.forEach(config => {
      templateMap.set(config.name, config);
   });
}
// 在 template.ts 中

export function getTemplate(name: string | TemplateItem): TemplateItem | undefined {
   if (typeof name === "string") {
      // 如果是字符串,判断是否为路径
      if (name.includes(".")) {
         // 如果有扩展名,转为模板配置
         return {
            name: name,
            file: name
         };
      } else {
         // 如果是模板名,从映射中获取
         return templateMap.get(name);
      }
   } else {
      // 如果本身就是模板配置,直接返回
      return name;
   }
}

export function generateTemplate(template: TemplateItem, data?: any) {
   try {
      const templateContent = fs.readFileSync(path.join(process.cwd(), YAML_BASE, template.file), "utf8");
      let templateEngine = null;

      if (template.engine) {
         // 如果配置了引擎,检查缓存
         if (!templateEngineCache[template.engine]) {
            // 缓存中不存在,加载模块
            templateEngineCache[template.engine] = require(template.engine);
         }
         templateEngine = templateEngineCache[template.engine];
      } else {
         // 默认 ejs
         templateEngine = require("ejs");
      }

      if (!templateEngine) {
         logger.error("Template generateTemplate 2", `Error generating template (${template.name}): unknow engine ${template.engine}`);
         return
      }
      const rendered = (templateEngine as any).render(templateContent, data);
      return rendered;
   } catch (error: any) {
      logger.error("Template generateTemplate 1", `Error generating template (${template.name}): ${error.message}`);
      throw error;
   }
}
