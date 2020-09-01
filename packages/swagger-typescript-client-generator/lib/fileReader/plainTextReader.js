"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plainTextReader = void 0;
var fs = require("fs");
exports.plainTextReader = function (options) {
    return fs.readFileSync(options.file, {
        encoding: "UTF-8",
        flag: "r",
    });
};
