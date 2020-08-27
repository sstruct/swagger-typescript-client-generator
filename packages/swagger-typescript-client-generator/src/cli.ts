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

const useCommand = (command: Command) => (args: CommandOptions) => {
  const transformSingleFile = async (readerOptions) => {
    const reader = readerFactory(readerOptions)
    const spec = (await reader()) as Spec
    const output = command(spec, {
      allowVoidParameters: readerOptions.allowVoidParameters,
      gatewayPrefix: readerOptions.gatewayPrefix,
    })
    const writer = writerFactory({ targetPath: readerOptions.targetPath })
    writer(output)
  }
  if (typeof args.configFile === "string" && Array.isArray(args.swaggers)) {
    args.swaggers.forEach((swagger) => {
      transformSingleFile({
        ...args,
        file: swagger.file,
        swaggerUrl: swagger.swagger_url,
        gatewayPrefix: swagger.gatewayPrefix,
        targetPath: swagger.targetPath,
      })
    })
  } else {
    transformSingleFile({
      file: args.file,
      gatewayPrefix: args.gatewayPrefix,
      targetPath: args.targetPath,
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
