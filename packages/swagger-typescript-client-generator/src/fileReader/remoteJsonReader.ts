import fetch from "node-fetch"
import { FileReaderOptions } from "./options"
import { FileReader } from "./fileReader"

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

export const remoteJsonReader: FileReader<any> = async <T extends unknown>(
  options: FileReaderOptions
): Promise<T> => {
  console.log("options.swaggerUrl: ", options.swaggerUrl)
  const content = await fetch(options.swaggerUrl)
    .then((res) => res.json())
    .then((json) => {
      console.log(json)
      return json
    })
  console.log("content: ", content)
  return content as T
}
