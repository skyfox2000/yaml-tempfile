import * as fs from "fs";
import { TemplateItem, getTemplate } from "./template";
import * as path from "path";
import { merge } from 'merge-anything';
import { ListItem } from "./file";
import logger from "../logger/logger";
import { FileData, saveFile } from "./filesave";
/**
 * 文件基础信息
 */
interface FileBase {
   /**
    * 是否覆盖文件
    */
   overwrite?: boolean;
   /**
    * 统一模板配置信息，子项如果没配置，使用该配置
    */
   template?: string | TemplateItem;
   /**
    * 输出目录
    */
   output_dir?: string;
   /**
    * 统一模板引擎，子项如果没配置，使用该配置，默认为ejs
    */
   engine?: string;
   /**
    * 是否跳过，配置了全部跳过
    */
   skip?: boolean;
   /**
    * 测试模式，仅显示打印生成结果，不实际生成文件
    * 子项如果没配置，使用该配置
    */
   test?: boolean;
   /**
    * 参数配置
    * 统一公共参数，子项整合该配置，一起使用
    */
   params?: any;
}

export type { FileBase }
/**
 * 生成器配置项
*/
interface GeneratorItem extends FileBase {
   /**
    * 生成文件名
    */
   file: string;
   /**
    * 子目录
    */
   sub_dir?: string;
}

export type { GeneratorItem }

/**
 * 
 * @param filePath 文件路径模板
 * @param params 参数
 * @returns 
 */
const varRegex = /\$([ULF])\{(\w+)\}|%\{(\w+)\}/g;
/**
 * 替换变量
 * @param {string} template 模板 
 * @param {object} params 参数
 * @returns {string}
 */
function replaceVars(template, params) {
   const regex = /\$([A-Z]{0,1})\{(\w+)\}/g;
   return template.replace(regex, (match, modifier, variable) => {
      let value = params[variable];
      if (value !== undefined) {
         if (modifier === 'U') {
            // 全部大写
            value = value.toUpperCase();
         } else if (modifier === 'L') {
            // 全部小写
            value = value.toLowerCase();
         } else if (modifier === 'F') {
            // 首字母大写
            value = value.charAt(0).toUpperCase() + value.slice(1);
         }
      } else return "$" + modifier + "{" + variable + "}";

      return value;
   });
}

/**
 * 调用模板生成文件
 * @param config 文件配置信息
 */
export function processFile(yamlBase: string, key: string, generator: Array<GeneratorItem>, listItem: ListItem, newFileMap: FileData) {
   generator.forEach((generatorFlow) => {
      const generatorItem = JSON.parse(JSON.stringify({ ...merge(listItem, generatorFlow) }));
      const { template, output_dir, file, params, ...restProps } = generatorItem;

      let { sub_dir = "" } = generatorItem;

      if (!file) {
         logger.error("Generate ProcessFile 1", `Error processing undefined file`, generatorItem);
         return;
      }
      if (!template) {
         logger.error("Generate ProcessFile 2", "Missing template for file: ", file);
         return;
      }
      if (!output_dir) {
         logger.error("Generate ProcessFile 3", "Missing output_dir for file: ", file);
         return;
      }

      let templateInfo: TemplateItem | undefined;
      if (template) {
         /// 文件单独模板优先
         if (typeof template === "string") {
            templateInfo = getTemplate(template);
         } else {
            templateInfo = template;
         }
      }
      if (!templateInfo) {
         logger.error("Generate ProcessFile 4", `Error processing undefined template file: `, template);
         return;
      }
      // 子路径单独处理，可能在文件中使用
      sub_dir = replaceVars(sub_dir, restProps);
      sub_dir = replaceVars(sub_dir, params);

      /**
       * 相对路径配置转换
       */
      let outputPath = path.join(output_dir, sub_dir);
      outputPath = replaceVars(outputPath, restProps);
      outputPath = replaceVars(outputPath, params);

      /**
       * 文件名配置转换
       */
      let target_file = replaceVars(file, restProps);
      target_file = replaceVars(target_file, params);

      /**
       * 完整输出路径
       */
      const fullPath = path.join(process.cwd(), outputPath);

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
         const tempData = {
            params,
            ...restProps
         }

         saveFile(yamlBase, key, templateInfo, tempData, newFileMap);
      } catch (error: any) {
         logger.error("Generate ProcessFile 5", `Error saveFile file ${path.join(outputPath, target_file)}: ${error.message}`);
      }
   });

}
