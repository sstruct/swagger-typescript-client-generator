# swagger-typescript-client-generator

Generate typescript client/models from swagger.json file

## install

```
npm install --global swagger-typescript-client-generator
```

## generate separate files for models and client

```
$ swagger-typescript-client-generator models -f swagger.json > models.ts
$ swagger-typescript-client-generator client MyApi "./models.ts" -f swagger.json > client.ts
```

## generate one file for both models and client

```
$ swagger-typescript-client-generator bundle MyApi -f swagger.json > client.ts
```

## commands

- `models` - generate only models
- `client <name> [importFromFile]` - generate client with given `name` and import models from optional parameter `[importFromFile]` (default `"./model"`)
- `bundle <name>` - generate models and client in single run

## parameters

- `--file, -f` - input file swagger.json
- `-allowVoidParameterTypes, -a` - generate parameter types (query, body, formData, headers) for `void` values.
  Can apply to both models and client (see #)

## TODO

- [x] ✅ 支持单个方法导出（用于 tree shaking 和解构赋值）
- [ ] 支持配置文件
  - [x] 配置文件读取
  - [ ] 配置文件逻辑
- [ ] 支持 enum
- [ ] 支持 mustache 模版
- [ ] 函数参数格式兼容目前（Param in url）
  - [ ] path.replace 抽象到方法内（大概能少几千行代码）
- [ ] 自动/批量替换当前接口
- [ ] 支持 superagent runtime
- [ ] 支持更新提示
- [ ] 支持 mock?
- [x] ✅ 生成 client API/type 顺序调整
- [x] ✅ 保留函数/字段注释
- [x] ✅ 请求函数参数格式优化，默认不传 undefined
- [x] ✅ 支持中文变量名
- [ ] ~~支持直接导出 js + .d.ts 文件 | ts -> js + .d.ts -> 生产打包时生成~~
