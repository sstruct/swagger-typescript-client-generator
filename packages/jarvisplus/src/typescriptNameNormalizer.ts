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
        // remove punctuations in name, e.g.:  "（），。,.", return "any" if nothing left
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
