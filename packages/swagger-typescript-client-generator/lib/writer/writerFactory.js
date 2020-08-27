"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writerFactory = void 0;
var prettierWriterComposite_1 = require("./prettierWriterComposite");
var stdoutWriter_1 = require("./stdoutWriter");
var fsWriter_1 = require("./fsWriter");
exports.writerFactory = function (options) {
    if (typeof options.targetPath !== "string") {
        console.warn("invalid targetPath, string expected");
    }
    if (options.targetPath) {
        return function (output, customOptions) {
            return prettierWriterComposite_1.prettierWriterComposite(fsWriter_1.fsWriter)(output, customOptions || options);
        };
    }
    return function (output, customOptions) {
        return prettierWriterComposite_1.prettierWriterComposite(stdoutWriter_1.stdoutWriter)(output, customOptions || options);
    };
};
