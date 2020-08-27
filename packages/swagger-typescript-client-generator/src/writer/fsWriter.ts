import * as fs from "fs"
import { Writer } from "./writer"
import { WriterOptions } from "./options"

export const fsWriter: Writer = (content: string, options: WriterOptions) => {
  fs.writeFile(options.targetPath, content, function (err) {
    if (err) return console.log(err)
  })
}
