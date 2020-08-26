"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultCommand = void 0;
exports.defaultCommand = function (swagger, options) {
    console.log("options: ", options);
    // const generator = new TypescriptClientGenerator(
    //   swagger,
    //   new TypescriptConverter(swagger, {
    //     allowVoidParameters: options.allowVoidParameterTypes
    //   })
    // )
    return "str";
    // return generator.generateSingleFile(options.name)
};
