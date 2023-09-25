import * as fs from 'fs';
import * as crypto from 'crypto';
import { TemplateItem, generateTemplate } from "./template";
import * as path from "path";

import logger from "../logger/logger";

interface FileData extends Record<string, string> {
}
export type { FileData }
const mapFiles = new Map<string, FileData>();

const getFileHash = (jsonDataStr: string): string => {
   const hash = crypto.createHash('md5').update(jsonDataStr).digest('hex');
   return hash;
}

const loadFileDataMap = (yamlBase: string, key: string) => {
   const mapFileName = path.join(process.cwd(), yamlBase, `${key}_filemap.json`);

   try {
      if (fs.existsSync(mapFileName)) {
         const fileMapData = fs.readFileSync(mapFileName, 'utf8');
         mapFiles[key] = JSON.parse(fileMapData) as FileData;
      } else {
         mapFiles[key] = {};
      }
   } catch (error) {
      logger.error(`读取 ${key}_filemap.json 文件错误！`)
   }
}

/**
 * 保存新文件
 * @param key 文件类型组
 * @param newFileMap 文件列表
 */
export const saveFileDataMap = (yamlBase: string, key: string, newFileMap: FileData) => {
   const mapFileName = path.join(process.cwd(), yamlBase, `${key}_filemap.json`);
   mapFiles[key] = newFileMap;

   if (newFileMap && Object.keys(newFileMap).length === 0 && fs.existsSync(mapFileName)) {
      fs.unlinkSync(mapFileName);
   } else {
      // 保存文件
      fs.writeFileSync(mapFileName, JSON.stringify(newFileMap, null, 3), 'utf-8');
   }
}

/**
 * 删除已取消的文件
 * @param key 删除已取消的文件
 * @param newFileMap 文件列表
 */
export const removeDeletedFiles = (yamlBase: string, key: string, newFileMap: FileData) => {
   if (!mapFiles[key]) {
      loadFileDataMap(yamlBase, key);
   }
   const oldFileMap: FileData = mapFiles[key];
   logger.debug(`删除 ${key} 中未使用的文件`);
   for (const filePath in oldFileMap) {
      if (!newFileMap[filePath]) {
         const fullFilePath = path.join(process.cwd(), filePath);
         logger.debug(`删除 ${filePath} 文件`);
         logger.trace(`删除 ${fullFilePath} 文件`);
         if (fs.existsSync(fullFilePath)) {
            fs.unlinkSync(fullFilePath);
         }
      }
   }
}

export const saveFile = (yamlBase: string, key: string, templateInfo: TemplateItem, tempData: any, newFileMap: FileData) => {
   const { skip, test, ...restData } = tempData;
   const fullPath: string = restData.target_full_dir;
   const fileName = restData.target_file;
   const filePath: string = path.join(restData.target_output_dir, fileName);
   const fullFilePath = path.join(fullPath, fileName);

   if (skip) {
      logger.warn("忽略文件" + path.join(restData.target_sub_dir, restData.target_file) + "！");
      return;
   }

   if (!mapFiles[key]) {
      loadFileDataMap(yamlBase, key);
   }
   const oldFileMap: FileData = mapFiles[key];
   logger.debug("tempData对象内容: ", { ...restData });

   const hash = getFileHash(templateInfo.source + "" + JSON.stringify(restData));
   newFileMap[filePath] = hash;

   if (tempData.test) {
      const rendered = generateTemplate(templateInfo, { tempData: { ...restData } });
      logger.debug("测试文件路径与文件名: ", filePath);
      logger.info("文件测试输出结果: ", rendered.trim(), "\n");
   } else if (oldFileMap[filePath] !== hash) {
      const rendered = generateTemplate(templateInfo, { tempData: { ...restData } });
      if (fs.existsSync(fullFilePath)) {
         if (restData.overwrite === false) {
            logger.warn("文件" + filePath + "禁止覆盖！");
         } else {
            fs.writeFileSync(fullFilePath, rendered.trim(), "utf8");
            logger.log("生成文件" + filePath + "完成！");
         }
      } else {
         /// 如果目录不存在，创建目录
         if (!fs.existsSync(fullPath))
            fs.mkdirSync(fullPath, { recursive: true });
         fs.writeFileSync(fullFilePath, rendered.trim(), "utf8");
         logger.log("生成文件" + filePath + "完成！");
      }
   } else {
      logger.info("文件" + filePath + "文件指纹相同！");
   }
}

