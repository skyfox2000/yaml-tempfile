import typescript from 'rollup-plugin-typescript2';
import ignore from 'rollup-plugin-ignore';

export default {
   input: ['src/index.ts'],
   external: ["ejs"],
   output: [{
      exports: "named", // 添加这一行
      file: 'dist/index.cjs',
      format: 'cjs'
   }, {
      exports: "named", // 添加这一行
      file: 'dist/index.js',
      format: 'es'
   }],
   plugins: [
      typescript(),
      ignore(['samples/**', 'src/packages/**'])
   ]
}