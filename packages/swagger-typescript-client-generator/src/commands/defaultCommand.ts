import { Command } from "./command"
import { CommandOptions } from "./options"
import { Spec } from "swagger-schema-official"
import { TypescriptClientGenerator } from "../typescriptClientGenerator"
import { TypescriptConverter } from "../typescriptConverter"

interface BundleCommandOptions extends CommandOptions {
  name: string
}

export const defaultCommand: Command<BundleCommandOptions> = (
  swagger: Spec,
  options: BundleCommandOptions
) => {
  console.log("options: ", options)
  // const generator = new TypescriptClientGenerator(
  //   swagger,
  //   new TypescriptConverter(swagger, {
  //     allowVoidParameters: options.allowVoidParameterTypes
  //   })
  // )
  return "str"
  // return generator.generateSingleFile(options.name)
}
