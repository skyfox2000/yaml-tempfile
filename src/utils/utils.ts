
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
