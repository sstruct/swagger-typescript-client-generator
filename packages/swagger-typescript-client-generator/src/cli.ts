import * as yargs from "yargs"
import { Spec } from "swagger-schema-official"
import { Command } from "./commands/command"
import { writerFactory } from "./writer/writerFactory"
import { readerFactory } from "./fileReader/readerFactory"
import { ConfigType } from "./fileReader/fileReader"
import { CommandOptions } from "./commands/options"
import {
  defaultCommand,
  bundleCommand,
  clientCommand,
  modelsCommand,
} from "./commands"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../package.json")

const commandCore = async (command, options) => {
  const reader = readerFactory({
    file: options.file,
    swaggerUrl: options.swaggerUrl,
  })
  const spec = (await reader()) as Spec
  const output = command(spec, {
    allowVoidParameters: options.allowVoidParameters,
    gatewayPrefix: options.gatewayPrefix,
    template: options.template,
  })
  const writer = writerFactory({ targetPath: options.targetPath })
  writer(output)
}

const useCommand = (command: Command) => (args: CommandOptions) => {
  if (typeof args.configFile === "string" && Array.isArray(args.swaggers)) {
    args.swaggers.forEach((swagger) => {
      commandCore(command, {
        file: swagger.file,
        swaggerUrl: swagger.swagger_url,
        gatewayPrefix: swagger.gatewayPrefix,
        targetPath: swagger.targetPath,
        template: args.template,
      })
    })
  } else {
    commandCore(command, {
      file: args.file,
      gatewayPrefix: args.gatewayPrefix,
      targetPath: args.targetPath,
      template: args.template,
    })
  }
}

const args = yargs
  .config(
    "configFile",
    "Jarvis config file path, default: .jarvis.yml",
    (file) => {
      const reader = readerFactory({ file })
      return reader() as ConfigType
    }
  )
  .option("allowVoidParameterTypes", {
    boolean: true,
    default: false,
    alias: "a",
  })
  .option("file", {
    type: "string",
    alias: "f",
    description: "swagger file",
    required: false,
  })
  .command(
    "$0",
    "generate models and client",
    (yargsBundle) => yargsBundle,
    useCommand(defaultCommand)
  )
  // .command(
  //   "models",
  //   "generate models files",
  //   (yargsModels) => yargsModels,
  //   useCommand(modelsCommand)
  // )
  // .command(
  //   "client <name> [importModelsFrom]",
  //   "generate client code",
  //   (yargsClient) =>
  //     yargsClient
  //       .positional("name", {
  //         type: "string",
  //       })
  //       .positional("importModelsFrom", {
  //         default: "./model",
  //         type: "string",
  //       }),
  //   useCommand(clientCommand)
  // )
  // .command(
  //   "bundle <name>",
  //   "generate models and client",
  //   (yargsBundle) =>
  //     yargsBundle.positional("name", {
  //       type: "string",
  //     }),
  //   useCommand(bundleCommand)
  // )
  .version(pkg.version).argv

if (process.env.DEBUG) {
  // tslint:disable-next-line no-console
  console.log(args)
}
