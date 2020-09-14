"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypescriptNameNormalizer = void 0;
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
            // remove punctuations in name, e.g.:  "（），。,.", return "any" if nothing left
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
