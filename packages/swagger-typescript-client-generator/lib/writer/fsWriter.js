"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsWriter = void 0;
var fs = require("fs");
exports.fsWriter = function (content, options) {
    fs.writeFile(options.targetPath, content, function (err) {
        if (err)
            return console.log(err);
    });
};
