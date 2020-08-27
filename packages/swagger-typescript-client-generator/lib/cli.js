"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var yargs = require("yargs");
var writerFactory_1 = require("./writer/writerFactory");
var readerFactory_1 = require("./fileReader/readerFactory");
var commands_1 = require("./commands");
// eslint-disable-next-line @typescript-eslint/no-var-requires
var pkg = require("../package.json");
var commandCore = function (command, options) { return __awaiter(void 0, void 0, void 0, function () {
    var reader, spec, output, writer;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                reader = readerFactory_1.readerFactory({
                    file: options.file,
                    swaggerUrl: options.swaggerUrl,
                });
                return [4 /*yield*/, reader()];
            case 1:
                spec = (_a.sent());
                output = command(spec, {
                    allowVoidParameters: options.allowVoidParameters,
                    gatewayPrefix: options.gatewayPrefix,
                    template: options.template,
                });
                writer = writerFactory_1.writerFactory({ targetPath: options.targetPath });
                writer(output);
                return [2 /*return*/];
        }
    });
}); };
var useCommand = function (command) { return function (args) {
    if (typeof args.configFile === "string" && Array.isArray(args.swaggers)) {
        args.swaggers.forEach(function (swagger) {
            commandCore(command, {
                file: swagger.file,
                swaggerUrl: swagger.swagger_url,
                gatewayPrefix: swagger.gatewayPrefix,
                targetPath: swagger.targetPath,
                template: args.template,
            });
        });
    }
    else {
        commandCore(command, {
            file: args.file,
            gatewayPrefix: args.gatewayPrefix,
            targetPath: args.targetPath,
            template: args.template,
        });
    }
}; };
var args = yargs
    .config("configFile", "Jarvis config file path, default: .jarvis.yml", function (file) {
    var reader = readerFactory_1.readerFactory({ file: file });
    return reader();
})
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
    .command("$0", "generate models and client", function (yargsBundle) { return yargsBundle; }, useCommand(commands_1.defaultCommand))
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
