import fetch from "node-fetch"
import { FileReaderOptions } from "./options"
import { FileReader } from "./fileReader"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

export const remoteJsonReader: FileReader<any> = async <
  T extends unknown = any
>(
  options: FileReaderOptions
): Promise<T> => {
  const content = await fetch(options.swaggerUrl)
    .then((res) => res.json())
    .then((json) => {
      return json
    })
  return content as T
}
