"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypescriptConverter = exports.TYPESCRIPT_TYPE_EMPTY_OBJECT = exports.TYPESCRIPT_TYPE_ANY = exports.TYPESCRIPT_TYPE_VOID = exports.TYPESCRIPT_TYPE_UNDEFINED = void 0;
var Mustache = require("mustache");
var templates_1 = require("./templates");
var parameterArrayToSchemaConverter_1 = require("./parameterArrayToSchemaConverter");
var parametersJarFactory_1 = require("./parametersJarFactory");
var swaggerTypes_1 = require("./swaggerTypes");
var typescriptNameNormalizer_1 = require("./typescriptNameNormalizer");
exports.TYPESCRIPT_TYPE_UNDEFINED = "undefined";
exports.TYPESCRIPT_TYPE_VOID = "void";
exports.TYPESCRIPT_TYPE_ANY = "any";
exports.TYPESCRIPT_TYPE_EMPTY_OBJECT = "{}";
var PARAMETER_PATH_SUFFIX = "PathParameter";
var PARAMETERS_QUERY_SUFFIX = "QueryParameters";
var PARAMETERS_BODY_SUFFIX = "BodyParameters";
var PARAMETERS_FORM_DATA_SUFFIX = "FormDataParameters";
var PARAMETERS_HEADER_SUFFIX = "HeaderParameters";
var TypescriptConverter = /** @class */ (function () {
    function TypescriptConverter(swagger, settings) {
        this.swagger = swagger;
        this.settings = settings;
        this.normalizer = new typescriptNameNormalizer_1.TypescriptNameNormalizer();
        this.parametersJarFactory = new parametersJarFactory_1.ParametersJarFactory(this.swagger);
        this.parametersArrayToSchemaConverter = new parameterArrayToSchemaConverter_1.ParametersArrayToSchemaConverter();
        this.settings = Object.assign({}, {
            allowVoidParameters: true,
            gatewayPrefix: "",
            template: "WhatWgFetchRequestFactory",
        }, settings || {});
    }
    TypescriptConverter.prototype.generateParameterTypesForOperation = function (path, method, operation) {
        var name = this.getNormalizer().normalize(method + "-" + path);
        var _a = this.getParametersJarFactory().createFromOperation(operation), queryParams = _a.queryParams, bodyParams = _a.bodyParams, formDataParams = _a.formDataParams, headerParams = _a.headerParams;
        var parameterTypes = [];
        if (this.settings.allowVoidParameters || queryParams.length > 0) {
            var schema = this.getParametersArrayToSchemaConverter().convertToObject(queryParams);
            parameterTypes.push(this.generateType(name + PARAMETERS_QUERY_SUFFIX, schema));
        }
        if (this.settings.allowVoidParameters || bodyParams.length > 0) {
            var schema = this.getParametersArrayToSchemaConverter().convertToUnion(bodyParams);
            parameterTypes.push(this.generateType(name + PARAMETERS_BODY_SUFFIX, schema));
        }
        if (this.settings.allowVoidParameters || formDataParams.length > 0) {
            var schema = this.getParametersArrayToSchemaConverter().convertToUnion(formDataParams);
            parameterTypes.push(this.generateType(name + PARAMETERS_FORM_DATA_SUFFIX, schema));
        }
        if (this.settings.allowVoidParameters || headerParams.length > 0) {
            var schema = this.getParametersArrayToSchemaConverter().convertToObject(headerParams);
            parameterTypes.push(this.generateType(name + PARAMETERS_HEADER_SUFFIX, schema));
        }
        return parameterTypes.join("\n");
    };
    TypescriptConverter.prototype.generateOperation = function (path, method, operation) {
        var _a;
        var _this = this;
        var name = this.getNormalizer().normalize(method + "-" + path);
        var _b = this.getParametersJarFactory().createFromOperation(operation), pathParams = _b.pathParams, queryParams = _b.queryParams, bodyParams = _b.bodyParams, formDataParams = _b.formDataParams, headerParams = _b.headerParams;
        var output = "";
        var parameters = pathParams.map(function (parameter) {
            return "" + parameter.name + PARAMETER_PATH_SUFFIX + ": " + _this.generateTypeValue(parameter);
        });
        var args = (_a = {},
            _a[swaggerTypes_1.PARAMETER_TYPE_PATH] = true,
            _a);
        var appendParametersArgs = function (paramsType, params, paramsSuffix) {
            if (_this.settings.allowVoidParameters || params.length > 0) {
                parameters.push(paramsType + ": " + name + paramsSuffix);
                args[paramsType] = true;
            }
        };
        appendParametersArgs(swaggerTypes_1.PARAMETER_TYPE_QUERY, queryParams, PARAMETERS_QUERY_SUFFIX);
        appendParametersArgs(swaggerTypes_1.PARAMETER_TYPE_BODY, bodyParams, PARAMETERS_BODY_SUFFIX);
        appendParametersArgs(swaggerTypes_1.PARAMETER_TYPE_FORM_DATA, formDataParams, PARAMETERS_FORM_DATA_SUFFIX);
        appendParametersArgs(swaggerTypes_1.PARAMETER_TYPE_HEADER, headerParams, PARAMETERS_HEADER_SUFFIX);
        var responseTypes = Object.entries(operation.responses || {})
            .map(function (_a) {
            var code = _a[0], response = _a[1];
            return _this.generateTypeValue(response);
        })
            .filter(function (value, index, self) {
            return self.indexOf(value) === index && value !== "any";
        })
            .join(" | ") || exports.TYPESCRIPT_TYPE_VOID;
        var requestArgs = "";
        Object.keys(args).forEach(function (arg) {
            requestArgs += args[arg] ? arg + "," : "";
        });
        var pathReplace = "";
        pathReplace += pathParams.map(function (parameter) {
            return "path = path.replace('{" + parameter.name + "}', String(" + parameter.name + PARAMETER_PATH_SUFFIX + "))";
        });
        output += Mustache.render(templates_1.readerTemplate("singleMethod"), {
            summary: operation.summary || false,
            name: name,
            parameters: parameters.join(", "),
            requestArgs: requestArgs,
            path: this.settings.gatewayPrefix
                ? "/" + this.settings.gatewayPrefix + path
                : path,
            pathReplace: pathReplace,
            method: method.toUpperCase(),
            responseTypes: responseTypes,
        });
        return output;
    };
    TypescriptConverter.prototype.generateType = function (name, definition) {
        return "export type " + this.getNormalizer().normalize(name) + " = " + this.generateTypeValue(definition) + "\n";
    };
    TypescriptConverter.prototype.generateTypeValue = function (definition) {
        var _this = this;
        if (definition.schema) {
            return this.generateTypeValue(definition.schema);
        }
        if (definition.$ref) {
            return this.getNormalizer().normalize(definition.$ref.substring(definition.$ref.lastIndexOf("/") + 1));
        }
        if (Array.isArray(definition.allOf) && definition.allOf.length > 0) {
            return (definition.allOf
                .map(function (schema) { return _this.generateTypeValue(schema); })
                .join(" & ") || exports.TYPESCRIPT_TYPE_VOID);
        }
        switch (definition.type) {
            case swaggerTypes_1.DEFINITION_TYPE_STRING: {
                if (definition.enum) {
                    return "'" + definition.enum.join("' | '") + "'";
                }
                return definition.type;
            }
            case swaggerTypes_1.DEFINITION_TYPE_NUMBER:
            case swaggerTypes_1.DEFINITION_TYPE_BOOLEAN: {
                return definition.type;
            }
            case swaggerTypes_1.DEFINITION_TYPE_INTEGER: {
                return swaggerTypes_1.DEFINITION_TYPE_NUMBER;
            }
            case swaggerTypes_1.DEFINITION_TYPE_ARRAY: {
                return "Array<" + this.generateTypeValue(definition.items) + ">";
            }
        }
        if (definition.type === swaggerTypes_1.DEFINITION_TYPE_OBJECT ||
            (!definition.type &&
                (definition.allOf ||
                    definition.properties ||
                    definition.additionalProperties))) {
            var output = "";
            var hasProperties = definition.properties && Object.keys(definition.properties).length > 0;
            if (hasProperties) {
                output += "{\n";
                output += Object.entries(definition.properties)
                    .map(function (_a) {
                    var name = _a[0], def = _a[1];
                    var output = "";
                    var isRequired = (definition.required || []).indexOf(name);
                    var description = def.description;
                    if (description) {
                        output += "/** " + description + " */\n";
                    }
                    output += "'" + name + "'" + (isRequired ? "?" : "") + ": " + _this.generateTypeValue(def);
                    return output;
                })
                    .join("\n");
                output += "\n}";
            }
            if (definition.additionalProperties &&
                typeof definition.additionalProperties === "object") {
                if (hasProperties) {
                    output += " & ";
                }
                output +=
                    "{ [key: string]: " +
                        this.generateTypeValue(definition.additionalProperties) +
                        " }";
            }
            if (output.trim().length === 0) {
                return exports.TYPESCRIPT_TYPE_EMPTY_OBJECT;
            }
            return output;
        }
        return exports.TYPESCRIPT_TYPE_ANY;
    };
    TypescriptConverter.prototype.generateClient = function (name) {
        var _this = this;
        var output = "";
        output += Mustache.render(templates_1.readerTemplate("methodModule"), {
            RequestFactoryName: "WhatWgFetchRequestFactory",
        });
        output += "\n";
        output += Object.entries(this.swagger.paths)
            .map(function (_a) {
            var path = _a[0], methods = _a[1];
            return Object.entries(methods)
                .map(function (_a) {
                var method = _a[0], operation = _a[1];
                return _this.generateOperation(path, method, operation);
            })
                .join("\n");
        })
            .join("\n");
        return output;
    };
    TypescriptConverter.prototype.getNormalizer = function () {
        return this.normalizer;
    };
    TypescriptConverter.prototype.getParametersJarFactory = function () {
        return this.parametersJarFactory;
    };
    TypescriptConverter.prototype.getParametersArrayToSchemaConverter = function () {
        return this.parametersArrayToSchemaConverter;
    };
    return TypescriptConverter;
}());
exports.TypescriptConverter = TypescriptConverter;
