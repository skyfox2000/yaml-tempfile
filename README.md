# 基于Yaml模板的自动化多文件生成器

## 项目功能 🔨

`yaml-tempfile` 是一个基于 Node.js 开发的工具，用于根据灵活的 YAML 模板文件配置，自动生成代码文件和目录结构。该工具支持多模板、多文件、多目录、多种控制（忽略、测试、覆盖），以及路径名和文件名的变量控制。默认使用 EJS 模板引擎。

## 安装使用步骤

### 安装

你可以使用 npm 或 yarn 来安装 `yaml-tempfile`:

```bash
npm install -D yaml-tempfile
# 或者
yarn add -D yaml-tempfile
```

### 使用

使用的目录是根目录下 `yaml-tempfile` 目录。
你需要创建该目录，并在该目录里面配置一个 YAML 配置文件config.yaml，下面是一个示例配置文件：

```yaml
logger_level: 5 # 日志打印级别，0: ERROR信息 1:WARN信息 2: LOG信息，3: INFO信息(默认)，4: DEBUG信息，5: TRACE信息
template_config: #单文件输出模板
   - name: API列表返回模板
     file: template/list_api.ejs
   - name: API对象返回模板
     file: template/object_api.ejs
file_config: # 单文件输出配置
   api: #API 接口代码配置
      template: API列表返回模板
      # test: true
      output_dir: /src/api
      generator: # 代码生成器，使用相同参数，根据列表生成多个文件
         # ${默认大小写} $U{}全部大写 $L{}全部小写 $F{}首字母大写(仅转换首字母)
         - file: ${API_Name}.ts # 入口文件
           sub_dir: /InterviewPerception # 可根据参数替换
      group_generator: # list分组代码生成器，将多个文件的配置信息，统一在一个文件内输出模板
         - file: list.json # 路由文件
           filter_by: # 过滤条件，根据list项目里的某个属性进行过滤，支持JSON路径(需$.开头)
              "$.sub_dir": "${file_path}/${name}"
              "$.target_file": index.a.ts
           template: 组件路由模板
         - file: index.a.ts # 路由文件
           filter_by: # 过滤字段，根据list项目里的某个属性进行过滤，支持JSON路径(需$.开头)
              "$.sub_dir": "${file_path}/${name}"
              "$.target_file": index.a.ts
           template: 组件统一导出模板
      list: # 多文件配置出来
         - name: 统计(左上角统计数据) # 配置数据
           params:
              API_Name: queryAmountStatistic
              API_Url: /api/queryAmountStatistic
              API_Entity: AmountStatisticEntity
         - name: 按地区统计（左边柱状图） # 配置数据
           params:
              API_Name: queryStatisticsOnDistrict
              API_Url: /api/queryStatisticsOnDistrict
              API_Entity: StatisticsOnArea
         # 其他文件配置...
```

在 `package.json` 中添加以下脚本：

```json
"scripts": {
  "gen": "yaml-tempfile [-c config.yaml]"  /// [-c config.yaml] 可选
}
```

然后，你可以运行以下命令来生成代码文件和目录：
```bash
npm run gen
# 或者
yarn gen
```

### 详细配置参数说明
`logger_level` （可选），日志打印级别，0: ERROR信息 1:WARN信息 2: LOG信息，3: INFO信息(默认)，4: DEBUG信息，5: TRACE信息

`template_config` （必填），用于配置生成代码文件的模板，根据配置生成特定内容。

- `name`（必填）: 模板名称，可任意名称（字母或者中文），必须是唯一的。

- `file`（必填）: 模板的实际路径。

`file_config` 用于配置生成代码文件和目录结构的详细信息，根据配置生成特定内容。以下是 `file_config` 的详细说明：

- `api`: 配置项名称，可任意名称（字母或者中文），用于说明配置或生成什么方面的内容，必须是唯一的。

- `template`（可选）: 默认模板，如果没有指定特定模板，将使用此模板。用于指定生成文件所使用的默认模板。

- `skip`（可选）: 如果设置为 `true`，将跳过当前项的生成，适用于需要在某些情况下临时禁用生成的情况。

- `test`（可选）: 如果设置为 `true`，测试，则仅打印生成的内容，但是不实际生成文件，可在以下任意一项位置使用该参数。
  
- `overwrite`（可选）: 默认为 `true`，主要用于仅修改模板的情况下重新生成文件，可在以下任意一项位置使用该参数。

- `engine`（可选）: 默认为 `ejs` 引擎。

- `output_dir`（必填）: 外层主目录，表示生成文件的根目录，必须指定。可以与内部的 `sub_dir` 组合以形成实际的目录结构。
  
- `group_generator`（必填之一）: 分组代码生成器配置，至少需要一个生成器配置项。根据列表中的每个生成器配置，一个文件对应生成一个文件。

  - `file`（必填）: 最终生成的文件名，支持变量替换。可以使用 `${}` 或 `$U{}` 或 `$L{}` 或 `$F{}` 进行大小写转换和首字母大写。

  - `sub_dir`（可选）: 子目录，用于在 `output_dir` 中创建子目录，可以根据参数进行替换。如果不需要子目录，则可忽略。
  
  - `template`（可选）: 用于指定生成文件所使用的默认模板。
  
  - `filter_by`（可选）: 数据过滤器，`group_generator`的数据来源是 `list` 生成文件后的所有文件信息，通过过滤器可以过滤出需要的文件列表，根据list项目里的某个属性进行过滤，支持JSON路径(需$.开头)
    - `"$.sub_dir"`: `"${file_path}/${name}"` # key进行过滤，过滤结果和value相同
    - `"$.target_file"`: `index.a.ts` # 多个条件时，必须同时满足

- `generator`（必填之一）: 代码生成器配置，至少需要一个生成器配置项。根据列表中的每个生成器配置，一个文件对应生成一个文件。

  - `file`（必填）: 最终生成的文件名，支持变量替换。可以使用 `${}` 或 `$U{}` 或 `$L{}` 或 `$F{}` 进行大小写转换和首字母大写。

  - `sub_dir`（可选）: 子目录，用于在 `output_dir` 中创建子目录，可以根据参数进行替换。如果不需要子目录，则可忽略。

- `list`（必填）: 多文件配置列表，每个项配置都会使用 `generator` 来生成文件，生成的文件数量取决于列表中的项数。

  - `name`: 配置数据的名称，用于标识生成的文件的用途或内容。

  - `params`: 配置具体参数，用于在生成文件时替换模板中的变量。

### 参数说明

1. **关键字**: 上面的参数都是关键字，用于标识配置的用途，对象的 Key不可更改，其它数据类的参数，应全部放入params对象。额外的关键字还包括：
   - `target_full_dir` ：完整输出路径，
   - `target_output_dir` ：完整相对路径，
   - `target_sub_dir` ：子路径
   - `target_file` ：文件名，
  
    这些关键字在软件运行时会自动写入，配置时请不要使用。这些关键字参数可在模板中使用。

2. **参数优先级**: 参数的优先级顺序为 `config` 级别（全局默认配置） -> `list` 中的单项配置 -> `generator` 中的每一项配置。后面的配置会覆盖前面的相同参数。对象会合并，数组会被后面的配置项覆盖。参数包括主参数和自定义数据参数，

3. **主参数**: 每个 `list` 配置项都包含了生成文件所需的具体参数。
   
4. **自定义数据参数**: 指params参数，用户数据参数全部放入该对象
   
5. **list_data参数**: 指list参数的文件列表，该参数为数组，每个数组元素为一个文件对象，对象中包含生成文件所需的具体参数

6. **list 配置**: 每个 `list` 配置项都包含了生成文件所需的具体参数，每一组配置参数都会使用 `generator` 配置来生成文件。因此，你可以根据需要在 `list` 中配置多个文件生成项。
   
7. **路径和文件名**: 路径和文件名支持变量替换，可以使用 `${}` 或 `$U{}` 或 `$L{}` 或 `$F{}` 进行大小写转换和首字母大写。替换时自动先使用主参数替换，然后使用自定义数据参数替换
   
8. **模板内对应的参数名**: 模板内对应的参数名为 `tempData`，用于在模板中使用。具体使用参考`yaml-tempfile` 目录下的模板样例

通过以上配置，你可以使用 `yaml-tempfile` 工具根据灵活的配置自动生成代码文件和目录结构，根据不同的需求生成不同的文件内容，提高项目开发的效率。

## Git commit ⻛格指南

- feat: 增加新功能
- fix: 修复问题
- style: 代码⻛格相关⽆影响运⾏结果的
- perf: 优化/性能提升
- refactor: 重构
- revert: 撤销修改
- test: 测试相关
- docs: ⽂档/注释
- chore: 依赖更新/脚⼿架配置修改等
- ci: 持续集成

## 许可证

该项目基于 MIT 许可证进行分发。更多详情请参阅 [LICENSE](LICENSE) 文件。
