"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("superagent");
var getParametersFromPayloadWithParamNames = function (payload, paramNames) {
    if (payload && typeof payload === "string")
        return payload;
    if (!Array.isArray(paramNames))
        return;
    var parameters = {};
    paramNames.forEach(function (name) {
        if (Object.hasOwnProperty.call(payload, name)) {
            parameters[name] = payload[name];
        }
    });
    return parameters;
};
var SuperagentRequestFactory = function (baseUrl, options) { return function (args) {
    var payload = args.payload, payloadIn = args.payloadIn, payloadInType = args.payloadInType;
    if (payloadInType) {
        args[payloadInType] = payload;
    }
    else if (payloadIn) {
        Object.keys(payloadIn).forEach(function (type) {
            args[type] = getParametersFromPayloadWithParamNames(payload, payloadIn[type]);
        });
    }
    var path = args.path, query = args.query, body = args.body, formData = args.formData, method = args.method, headers = args.headers;
    var headersObject = new Headers({});
    new Headers(headers).forEach(function (value, key) {
        headersObject.set(key, String(value));
    });
    var fetchOptions = Object.assign({}, { method: method, headers: headersObject });
    if (body !== undefined) {
        fetchOptions.body = body;
    }
    else if (formData && Object.keys(formData).length > 0) {
        fetchOptions.body = Object.keys(formData).reduce(function (data, key) {
            data.append(key, formData[key]);
            return data;
        }, new FormData());
    }
    var callback = [
        "function",
        "object",
    ].includes(typeof options.request)
        ? options.request
        : request;
    var handleResponse = function (response) {
        if (typeof options.onResponse === "function")
            return options.onResponse(response);
        return response;
    };
    var handleError = function (error) {
        if (typeof options.onError === "function")
            return options.onError(error);
        throw error;
    };
    var fullUrl = [baseUrl, path].join("");
    var agentMethod = method.toLocaleLowerCase();
    switch (agentMethod) {
        case "delete":
        case "get":
            return callback[agentMethod](fullUrl)
                .query(query)
                .then(function (res) { return handleResponse(res); })
                .catch(function (err) { return handleError(err); });
        default:
            return callback[agentMethod](fullUrl)
                .query(query)
                .send(fetchOptions.body)
                .then(function (res) { return handleResponse(res); })
                .catch(function (err) { return handleError(err); });
    }
}; };
exports.default = SuperagentRequestFactory;
