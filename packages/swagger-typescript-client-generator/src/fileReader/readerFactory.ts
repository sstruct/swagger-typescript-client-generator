import { FileReaderOptions } from "./options"
import { jsonReader } from "./jsonReader"
import { yamlReader } from "./yamlReader"
import { remoteJsonReader } from "./remoteJsonReader"

export const readerFactory = (options: FileReaderOptions) => {
  if (
    typeof options.file !== "string" &&
    typeof options.swaggerUrl !== "string"
  ) {
    throw new Error("invalid type for file/swagger_url option, string expected")
  }

  if (options.swaggerUrl) {
    return remoteJsonReader
  }

  if (options.file.endsWith(".json")) {
    return jsonReader
  }

  if (options.file.endsWith(".yml") || options.file.endsWith(".yaml")) {
    return yamlReader
  }

  throw new Error(
    `cannot create reader for ${options.file}. Supported formats: json`
  )
}
