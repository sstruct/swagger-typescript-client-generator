import * as yargs from "yargs"
import * as path from "path"
import { Spec } from "swagger-schema-official"
import { Command } from "./commands/command"
import { writerFactory } from "./writer/writerFactory"
import { readerFactory } from "./fileReader/readerFactory"
import { ConfigType } from "./fileReader/fileReader"
import { CommandOptions } from "./commands/options"
import { defaultCommand, bundleCommand } from "./commands"

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require("../package.json")

const commandCore = async (command, options) => {
  const reader = readerFactory({
    file: options.file,
    swaggerUrl: options.swaggerUrl,
  })

  const customAgentRelativePath = path.relative(
    path.dirname(options.targetPath),
    options.customAgent
  )

  const spec = (await reader()) as Spec
  const output = command(spec, {
    allowVoidParameters: options.allowVoidParameters,
    backend: options.backend,
    template: options.template,
    mergeParam: options.mergeParam,
    customAgent: `./${customAgentRelativePath}`,
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
        backend: swagger.backend,
        targetPath: swagger.targetPath,
        template: args.template,
        mergeParam: args.mergeParam,
        customAgent: args.customAgent,
      })
    })
  } else {
    commandCore(command, {
      file: args.file,
      backend: args.backend,
      targetPath: args.targetPath,
      template: args.template,
      mergeParam: args.mergeParam,
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
