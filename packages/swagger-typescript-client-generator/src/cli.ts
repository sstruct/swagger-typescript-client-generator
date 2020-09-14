import * as yargs from "yargs"
import { Spec } from "swagger-schema-official"
import { Command } from "./commands/command"
import { writerFactory } from "./writer/writerFactory"
import { readerFactory } from "./fileReader/readerFactory"
import { bundleCommand, clientCommand, modelsCommand } from "./commands"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../package.json")

const useCommand = (command: Command) => (args: yargs.Arguments<any>) => {
  const reader = readerFactory(args)
  const spec: Spec = reader(args)

  const output = command(spec, args)
  const writer = writerFactory(args)
  writer(output, args)
}

const args = yargs
  .option("file", {
    type: "string",
    alias: "f",
    description: "swagger file",
    required: true,
  })
  .option("allowVoidParameterTypes", {
    boolean: true,
    default: false,
    alias: "a",
  })
  .option("verbose", {
    alias: "v",
    type: "boolean",
    description: "Run with verbose logging",
  })
  .command(
    "models",
    "generate models files",
    (yargsModels) => yargsModels,
    useCommand(modelsCommand)
  )
  .command(
    "client <name> [importModelsFrom]",
    "generate client code",
    (yargsClient) =>
      yargsClient
        .positional("name", {
          type: "string",
        })
        .positional("importModelsFrom", {
          default: "./model",
          type: "string",
        }),
    useCommand(clientCommand)
  )
  .command(
    "bundle <name>",
    "generate models and client",
    (yarngsBundle) =>
      yarngsBundle.positional("name", {
        type: "string",
      }),
    useCommand(bundleCommand)
  )
  .version(pkg.version)
  .demandCommand(1).argv

if (process.env.DEBUG) {
  // tslint:disable-next-line no-console
  console.log(args)
}
