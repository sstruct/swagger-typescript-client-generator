import { prettierWriterComposite } from "./prettierWriterComposite"
import { stdoutWriter } from "./stdoutWriter"
import { fsWriter } from "./fsWriter"
import { WriterOptions } from "./options"
import { Writer } from "./writer"

export const writerFactory = (options: WriterOptions): Writer => {
  if (typeof options.targetPath !== "string") {
    console.warn("invalid targetPath, string expected")
  }
  if (options.targetPath) {
    return (output, customOptions) =>
      prettierWriterComposite(fsWriter)(output, customOptions || options)
  }
  return (output, customOptions) =>
    prettierWriterComposite(stdoutWriter)(output, customOptions || options)
}
