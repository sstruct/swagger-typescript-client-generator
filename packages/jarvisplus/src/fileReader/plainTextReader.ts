import { FileReaderOptions } from "./options"
import { FileReader } from "./fileReader"
import * as fs from "fs"

export const plainTextReader: FileReader<any> = (
  options: FileReaderOptions
): string => {
  return fs.readFileSync(options.file, {
    encoding: "UTF-8",
    flag: "r",
  }) as string
}
