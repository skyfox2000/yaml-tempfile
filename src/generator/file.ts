import * as crypto from "crypto";
import * as fs from "fs";
import { merge } from 'merge-anything';
import logger from "../logger/logger";
import { FileBase, GeneratorItem, processFile } from "./generator";
import { FileData, removeDeletedFiles, saveFileDataMap } from "./filesave";

/**
 * 配置根目录，存放template目录和文件指纹
 */
let YAML_BASE = "";

/**
 * 待处理的每个项目
 */
interface ListItem extends FileBase {
  /**
   * 项目名称
   */
  name: string;
  /**
   * 指定执行的生成器，如果没有指定，则全部执行
   */
  flows?: Array<Number>;
}

/**
 * 文件类型基础配置项
 * params为具体配置数据
*/
interface FileItem extends FileBase {
  /**
   * 文件生成器
   */
  generator: Array<GeneratorItem>;
  /**
   * 多文件参数配置，循环生成多文件
   */
  list?: Array<ListItem>;
}

export { FileItem, ListItem };

/**
 * 文件配置项
 * key 可作为数据转换器
*/
interface FileConfig {
  /**
   * 文件配置内容
   */
  [key: string]: FileItem;
}
export { FileConfig };

/**
 * 模板引擎缓存
 */
const transformerEngineCache = {};
/**
 * 文件配置指纹缓存
 */
const fileFingerprints = new Map<string, string>();

/**
 * 获取文件配置指纹
 * @param config 文件配置信息
 * @returns 文件指纹
 */
export function getFileFingerprint(config: FileItem) {
  const content = JSON.stringify(config);

  return crypto.createHash("md5")
    .update(content)
    .digest("hex");
}

/**
 * 加载文件配置信息
 * @param configs 文件配置信息
 */
export function loadFileConfigs(yamlBase: string, configs: FileConfig) {
  YAML_BASE = yamlBase;
  for (const key in configs) {
    const fileInfo = configs[key];
    if (fileInfo.skip) continue;
    const { list, generator, params, ...otherProps } = fileInfo;
    if (!generator || !generator.length) {
      logger.error("File loadFileConfigs 1", "Missing generator configuration for file: ", fileInfo);
      continue;
    }

    // 包装 params 为对象，如果不存在则使用 fileInfo 作为默认值
    const wrappedParams = { ...otherProps, params };

    const listItems = (list
      ? list.map(data => ({ ...merge(wrappedParams, data) }))
      : [wrappedParams]) as ListItem[];

    const newFileMap: FileData = {};
    listItems.forEach(listItem => {
      processFile(yamlBase, key, generator, listItem, newFileMap);
    });
    
    removeDeletedFiles(YAML_BASE, key, newFileMap);
    saveFileDataMap(YAML_BASE, key, newFileMap);
  }
}
