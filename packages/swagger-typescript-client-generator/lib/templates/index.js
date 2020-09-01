"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readerTemplate = void 0;
var path = require("path");
var readerFactory_1 = require("../fileReader/readerFactory");
exports.readerTemplate = function (name) {
    if (name === void 0) { name = "methodModule"; }
    var file = path.resolve(__dirname, "../templates/" + name + ".mustache");
    var reader = readerFactory_1.readerFactory({ file: file });
    try {
        return reader();
    }
    catch (error) {
        throw new Error("template " + name + " not found at " + file);
    }
};
