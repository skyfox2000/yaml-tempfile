import { processFile, GeneratorItem, FileBase } from "./generator";
import { merge } from 'merge-anything';
import { ListItem } from "./file";
import { FileData } from "./filesave";
import jsonpath from "jsonpath"
import logger from "../logger/logger";

/**
 * 处理分组，并整合数据，处理后调用processFile方法继续执行
 * @param yamlBase 根目录
 * @param key 项目主键，区分file_config里面不同项目
 * @param generator 生成器配置列表
 * @param listItems 待处理list列表
 * @param newFileMap 新文件指纹列表
 */
export function processGroup(yamlBase: string, key: string, generator: Array<GeneratorItem>, wrappedParams: FileBase, listItems: ListItem[], newFileMap: FileData) {
   generator.forEach((generatorFlow) => {
      const generatorItem: GeneratorItem = JSON.parse(JSON.stringify({ ...merge(wrappedParams, generatorFlow) }));
      const { template, output_dir, file, params, ...restProps } = generatorFlow;
      const listData = [];
      if (generatorFlow.filter_by) {
         for (const listItem of listItems) {
            let isValid = true;
            for (const filterKey in generatorFlow.filter_by) {
               const filterValue = generatorFlow.filter_by[filterKey];
               const itemValue = jsonpath.query(listItem, filterKey);
               if (!itemValue || itemValue[0] !== filterValue) {
                  isValid = false;
                  break;
               }
            }
            if (isValid) {
               listData.push(listItem);
            }
         }
      }
      // if (generatorFlow.group_by) {
      //    for (const listItem of listItems) {
      //       const listItemData = jsonpath.query(listItem, generatorFlow.group_by);
      //       if (listItemData.length > 0 && listItemData[0] instanceof String) {
      //          generatorFlow.group_name = listItemData[0];
      //          listData.push(listItem);
      //       }
      //    }
      // } else listData.push(...listItems);

      generatorItem.list_data = listData;
      processFile(yamlBase, key, generatorItem, { name: generatorFlow.name }, newFileMap)
   });
}