# jarvisplus

根据 swagger 文档生成 `typescript` 客户端代码

## 安装

```sh
npm install --global @terminus/jarvisplus
```

## 用法

```sh
jarvisplus --configFile .jarvis.yml
```

## 参数

- `--configFile, -f` - jarvis config file path

## 配置文件格式

```yml
swaggers:
    # 后端swagger地址, url请带上 /v2/api-docs
    - swagger_url?: string
    - file?: string
    # 本地 swagger 文件, 支持 json/yml，有 swagger_url 时，优先使用 swagger_url
      backend?: string
      alias: string
      targetPath: string
# api client 生成的类型. 现在仅支持 js ts
target_language: "ts" | "js"
# 所依赖的请求模块, default: whatwg-fetch
template: "whatwg-fetch" | "superagent-request"
# 此配置仅当 template 为 superagent-request 时可用
# 自定义 superagent 路径，可自行添加 headers 或中间件，不传则使用默认 superagent
customAgent?: string
# 是否开启 API 校验。默认为false。开启
check_api: boolean
# 方法名称上忽略 alias
ignore_alias: boolean
# 输出的 mock 文件位置。如果需要开启mock功能的话，需要配置次地址。
need_mock: boolean
# gateway_url: http://dev.gateway.mall.cnooc.com.cn
gateway_url: string
# models存放的文件夹
modelFolder: boolean
# 请求参数（path param, query, body, formData) 是否合并到一起，默认为 false
mergeParam?: boolean
```

## TODO

- [x] ✅ 支持单个方法导出（用于 tree shaking 和解构赋值）
- [x] 支持配置文件
  - [x] 配置文件读取
  - [x] 配置文件逻辑
    - [x] swagger_url
    - [x] api prefix 参考 nginx 字段名
    - [x] outDir/targetPath
    - [x] template type
    - [ ] init command with template?
- [x] 支持 enum
- [x] 支持 mustache 模版
- [x] 支持 superagent runtime
- [x] 函数参数格式兼容目前（Param in url）
- [ ] 自动/批量替换当前接口
- [ ] 支持模块分拆（包括相同类型提取）
- [ ] 支持更新提示
- [ ] 支持 mock
- [x] ✅ 生成 client API/type 顺序调整
- [x] ✅ 保留函数/字段注释
- [x] ✅ 请求函数参数格式优化，默认不传 undefined
- [x] ✅ 支持中文变量名
