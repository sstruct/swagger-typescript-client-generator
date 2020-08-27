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
  const generateSingleFile = async (readerOptions) => {
    const reader = readerFactory(readerOptions)
    const spec = (await reader()) as Spec
    const output = command(spec, args)
    const writer = writerFactory(args)
    writer(output, args)
  }
  if (Array.isArray(args.swaggers)) {
    args.swaggers.forEach((swagger) => {
      generateSingleFile({ swaggerUrl: swagger.swagger_url })
    })
  } else {
    generateSingleFile({ file: args.file })
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
