import * as path from "path"
import { readerFactory } from "../fileReader/readerFactory"

type TemplateType = "methodModule" | "singleMethod"

export const readerTemplate = (name: TemplateType = "methodModule"): string => {
  const file = path.resolve(__dirname, `../templates/${name}.mustache`)
  const reader = readerFactory({ file })
  try {
    return reader() as string
  } catch (error) {
    throw new Error(`template ${name} not found at ${file}`)
  }
}
