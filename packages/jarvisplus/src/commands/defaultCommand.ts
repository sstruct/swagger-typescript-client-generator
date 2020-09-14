import { Command } from "./command"
import { CommandOptions } from "./options"
import { Spec } from "swagger-schema-official"
import { TypescriptClientGenerator } from "../typescriptClientGenerator"
import { TypescriptConverter } from "../typescriptConverter"

interface DefaultCommandOptions extends CommandOptions {
  name: string
}

export const defaultCommand: Command<DefaultCommandOptions> = (
  swagger: Spec,
  options: DefaultCommandOptions
) => {
  const generator = new TypescriptClientGenerator(
    swagger,
    new TypescriptConverter(swagger, {
      allowVoidParameters: options.allowVoidParameterTypes,
      backend: options.backend,
      template: options.template,
      mergeParam: options.mergeParam,
      customAgent: options.customAgent,
    })
  )
  return generator.generateSingleFile(options.name)
}
