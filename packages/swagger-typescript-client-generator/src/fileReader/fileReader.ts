import { FileReaderOptions } from "./options"
import { Spec } from "swagger-schema-official"

export type FileReader<T = Spec> = (options: FileReaderOptions) => T

export type ConfigType = {
  swaggers: {
    swagger_url: string
    alias: string
    backend: string
    // tags:
    target_path: string
  }[]
  // api client 生成的类型. 现在仅支持 js ts
  target_language: "ts" | "js"
  // 所依赖的请求代理模块, default： default | tangram
  template: "fetch" | "superagent" // TODO: 支持的选项
  // 是否开启 API 校验。默认为false。开启
  check_api: boolean
  // 方法名称上忽略 alias
  ignore_alias: boolean
  // 输出的 mock 文件位置。如果需要开启mock功能的话，需要配置次地址。
  need_mock: boolean
  // gateway_url: http://dev.gateway.mall.cnooc.com.cn
  gateway_url: string
  // models存放的文件夹
  modelFolder: boolean
}
