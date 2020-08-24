"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var TypescriptNameNormalizer = /** @class */ (function () {
    function TypescriptNameNormalizer() {
    }
    TypescriptNameNormalizer.prototype.normalize = function (name) {
        return name
            .split(/[/.-]/g)
            .filter(Boolean)
            .map(function (segment) {
            if (segment.startsWith("{") && segment.endsWith("}")) {
                segment =
                    "By" +
                        segment[1].toUpperCase() +
                        segment.substring(2, segment.length - 1);
            }
            return segment;
        })
            .map(function (str, index) {
            // TODO: 保留函数/字段注释
            // TODO: 请求函数参数格式优化，默认不传 undefined
            // TODO: 支持直接导出 js + .d.ts 文件 | ts -> js + .d.ts
            // TODO: 支持 mustache 模版
            // 排除"（），。,."等标点，需要后端改。暂时处理成 any，ref:
            // 替换所有非字母/文字字符为 ""，如果替换后结果为 ""，返回 "any"
            // ref 1. https://stackoverflow.com/a/6671856/5121972
            // ref 2. http://www.regular-expressions.info/unicode.html#category
            return str.replace(/[^\p{L}\p{N}]*/gu, "") || "any";
        })
            .map(function (str, index) {
            return index === 0 ? str : str[0].toUpperCase() + str.substr(1);
        })
            .join("");
    };
    return TypescriptNameNormalizer;
}());
exports.TypescriptNameNormalizer = TypescriptNameNormalizer;
