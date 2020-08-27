"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readerFactory = void 0;
var jsonReader_1 = require("./jsonReader");
var yamlReader_1 = require("./yamlReader");
var remoteJsonReader_1 = require("./remoteJsonReader");
exports.readerFactory = function (options) {
    if (typeof options.file !== "string" &&
        typeof options.swaggerUrl !== "string") {
        throw new Error("invalid type for file/swagger_url option, string expected");
    }
    if (options.swaggerUrl) {
        return function () { return remoteJsonReader_1.remoteJsonReader(options); };
    }
    if (options.file.endsWith(".json")) {
        return function () { return jsonReader_1.jsonReader(options); };
    }
    if (options.file.endsWith(".yml") || options.file.endsWith(".yaml")) {
        return function () { return yamlReader_1.yamlReader(options); };
    }
    throw new Error("cannot create reader for " + options.file + ". Supported formats: json");
};
