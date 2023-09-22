import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';

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
      del({ hook: "buildEnd", targets: ['src/**/*.js', '!dist/index.d.ts'], verbose: true })
   ]
}