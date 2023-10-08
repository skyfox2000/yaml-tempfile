import { TemplateItem, getTemplate } from "./template";
import * as path from "path";
import { merge } from 'merge-anything';
import { ListItem } from "./file";
import logger from "../logger/logger";
import { FileData, saveFile } from "./filesave";
import jsonpath from "jsonpath"

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
   /**
    * 指定spec属性获取的结果，模板中可通过tempData.spec_data调用
    */
   spec_data?: any;
}

export type { FileBase }
/**
 * 生成器配置项
*/
interface GeneratorItem extends ListItem {
   /**
    * 生成文件名
    */
   file: string;
   /**
    * 子目录
    */
   sub_dir?: string;
   /**
    * 指定属性，使用JSON路径(需$.开头)，没有则不处理，如有，则替换成指定对象，模板中可通过tempData.spec调用
    */
   spec?: string;
   /**
    * 分组字段，支持JSON路径(需$.开头)，根据list项目里的某个属性进行分组，结果存入groupName
    */
   filter_by?: {
      [key: string]: string;
   };
   /**
    * 分组字段，支持JSON路径(需$.开头)，根据list项目里的某个属性进行分组，结果存入groupName
    */
   group_by?: string;
   /**
    * 分组名称
    */
   group_name?: string;

   /**
    * list数据
    */
   list_data?: ListItem[]
   /**
    * 完整输出路径
    */
   target_full_dir?: string;
   /**
    * 完整相对路径
    */
   target_output_dir?: string;
   /**
    * 子目录
    */
   target_sub_dir?: string;
   /**
    * 文件名
    */
   target_file?: string;
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
export function replaceVars(template, params) {
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
   }) as string;
}

/**
 * 调用模板生成文件
 * @param yamlBase 根目录
 * @param key 项目主键，区分file_config里面不同项目
 * @param generator 生成器配置列表
 * @param listItem 待处理list项目
 * @param newFileMap 新文件指纹列表
 */
export function processGenerator(yamlBase: string, key: string, generator: Array<GeneratorItem>, listItem: ListItem, newFileMap: FileData, newListItems?: ListItem[]) {
   generator.forEach((generatorFlow) => {
      processFile(yamlBase, key, generatorFlow, listItem, newFileMap, newListItems);
   });

}

export function processFile(yamlBase: string, key: string, generatorFlow: GeneratorItem, listItem: ListItem, newFileMap: FileData, newListItems?: ListItem[]) {
   const generatorItem: GeneratorItem = JSON.parse(JSON.stringify({ ...merge(listItem, generatorFlow) }));
   const { template, output_dir, file, params, ...restProps } = generatorItem;

   let { sub_dir = "", spec = "" } = generatorItem;

   if (!file) {
      logger.error(`Error processing undefined file`, generatorItem);
      return;
   }
   if (!template) {
      logger.error("Missing processing template for file: ", file);
      return;
   }
   if (!output_dir) {
      logger.error("Missing processing output_dir for file: ", file);
      return;
   }

   let templateInfo: TemplateItem | undefined;
   if (template) {
      /// 文件单独模板优先
      if (typeof template === "string") {
         templateInfo = getTemplate(template, generatorItem);
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
      const tempData: ListItem = {
         params,
         ...restProps
      }

      /**
       * 指定属性，没有则不处理，如有，则替换成指定对象，模板中可通过tempData.spec调用
       * 路径规范：https://github.com/dchester/jsonpath
       */
      if (spec) {
         const specData = jsonpath.query(tempData, spec);
         logger.debug(spec, tempData, specData)
         if (specData.length > 0) {
            tempData.spec_data = specData[0];
         } else {
            logger.warn("Missing processing specData for file: ", path.join(outputPath, target_file), spec);
            return;
         }
      }

      if (newListItems) newListItems.push(tempData);
      saveFile(yamlBase, key, templateInfo, tempData, newFileMap);
   } catch (error: any) {
      logger.error(`Error processFile saveFile file ${path.join(outputPath, target_file)}: ${error.message}`);
   }
}