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
      gatewayPrefix: options.gatewayPrefix,
      template: options.template,
      mergeParam: options.mergeParam,
    })
  )
  return generator.generateSingleFile(options.name)
}
