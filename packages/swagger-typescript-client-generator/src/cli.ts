import * as yargs from "yargs"
import { Spec } from "swagger-schema-official"
import { Command } from "./commands/command"
import { writerFactory } from "./writer/writerFactory"
import { readerFactory } from "./fileReader/readerFactory"
import {
  defaultCommand,
  bundleCommand,
  clientCommand,
  modelsCommand,
} from "./commands"
import { ConfigType } from "./fileReader/fileReader"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../package.json")

const useCommand = (command: Command) => (args: yargs.Arguments<any>) => {
  if (Array.isArray(args.swaggers)) {
    args.swaggers.forEach((swagger) => {
      console.log("swagger: ", swagger)
      const reader = readerFactory({ swaggerUrl: swagger.swagger_url })
      const spec = reader({ swaggerUrl: swagger.swagger_url }) as Spec
      // const output = command(spec, args)
      // const writer = writerFactory(args)
      // writer(output, args)
    })
  } else {
    const reader = readerFactory(args)
    const spec = reader(args) as Spec
    const output = command(spec, args)
    const writer = writerFactory(args)
    writer(output, args)
  }
}

const args = yargs
  .config("configFile", "Jarvis config file path[.jarvis.yml]", (file) => {
    const reader = readerFactory({ file })
    const config = reader({ file }) as ConfigType
    return config
  })
  .option("allowVoidParameterTypes", {
    boolean: true,
    default: false,
    alias: "a",
  })
  .command(
    "$0",
    "generate models and client",
    (yargsBundle) =>
      yargsBundle.positional("name", {
        type: "string",
      }),
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
