import { Normalizer } from "./normalizer"

export class TypescriptNameNormalizer implements Normalizer {
  public normalize(name: string): string {
    return name
      .split(/[/.-]/g)
      .filter(Boolean)
      .map((segment: string) => {
        if (segment.startsWith("{") && segment.endsWith("}")) {
          segment =
            "By" +
            segment[1].toUpperCase() +
            segment.substring(2, segment.length - 1)
        }
        return segment
      })
      .map((str, index) => {
        // ⭐️ TODO: 支持单个方法导出（用于 tree shaking 和解构赋值）
        // TODO: 支持 superagent runtime
        // TODO: 函数参数格式兼容目前（Param in url）
        // TODO: 自动替换当前接口
        // TODO: 支持 mustache 模版
        // ✅ 生成 client API/type 顺序调整
        // ✅ 保留函数/字段注释
        // ✅ 请求函数参数格式优化，默认不传 undefined
        // ✅ 支持中文变量名
        // ❌ 支持直接导出 js + .d.ts 文件 | ts -> js + .d.ts -> 生产打包时生成

        // 排除"（），。,."等标点，需要后端改。暂时处理成 any，ref:
        // 替换所有非字母/字符/数字字符为 ""，如果替换后结果为 ""，返回 "any"
        // ref 1. https://stackoverflow.com/a/6671856/5121972
        // ref 2. http://www.regular-expressions.info/unicode.html#category
        return str.replace(/[^\p{L}\p{N}]*/gu, "") || "any"
      })
      .map((str, index) => {
        return index === 0 ? str : str[0].toUpperCase() + str.substr(1)
      })
      .join("")
  }
}
