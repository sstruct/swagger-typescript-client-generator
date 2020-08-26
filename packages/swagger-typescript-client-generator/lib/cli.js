"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var writerFactory_1 = require("./writer/writerFactory");
var readerFactory_1 = require("./fileReader/readerFactory");
var commands_1 = require("./commands");
// eslint-disable-next-line @typescript-eslint/no-var-requires
var pkg = require("../package.json");
var useCommand = function (command) { return function (args) {
    if (Array.isArray(args.swaggers)) {
        args.swaggers.forEach(function (swagger) {
            console.log("swagger: ", swagger);
            var reader = readerFactory_1.readerFactory({ swaggerUrl: swagger.swagger_url });
            var spec = reader({ swaggerUrl: swagger.swagger_url });
            // const output = command(spec, args)
            // const writer = writerFactory(args)
            // writer(output, args)
        });
    }
    else {
        var reader = readerFactory_1.readerFactory(args);
        var spec = reader(args);
        var output = command(spec, args);
        var writer = writerFactory_1.writerFactory(args);
        writer(output, args);
    }
}; };
var args = yargs
    .config("configFile", "Jarvis config file path[.jarvis.yml]", function (file) {
    var reader = readerFactory_1.readerFactory({ file: file });
    var config = reader({ file: file });
    return config;
})
    .option("allowVoidParameterTypes", {
    boolean: true,
    default: false,
    alias: "a",
})
    .command("$0", "generate models and client", function (yargsBundle) {
    return yargsBundle.positional("name", {
        type: "string",
    });
}, useCommand(commands_1.defaultCommand))
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
    .version(pkg.version).argv;
if (process.env.DEBUG) {
    // tslint:disable-next-line no-console
    console.log(args);
}
