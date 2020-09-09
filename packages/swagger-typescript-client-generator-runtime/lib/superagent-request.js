"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("superagent");
var getParametersFromPayloadWithParamNames = function (payload, paramNames) {
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
var SuperagentRequestFactory = function (baseUrl, options) { return function (_a) {
    var path = _a.path, payload = _a.payload, payloadIn = _a.payloadIn, query = _a.query, body = _a.body, formData = _a.formData, method = _a.method, headers = _a.headers;
    if (payloadIn) {
        Object.keys(payloadIn).forEach(function (payloadType) {
            switch (payloadType) {
                case "query":
                    query = getParametersFromPayloadWithParamNames(payload, payloadIn[payloadType]);
                    break;
                case "body":
                    body = getParametersFromPayloadWithParamNames(payload, payloadIn[payloadType]);
                    break;
                case "headers":
                    headers = getParametersFromPayloadWithParamNames(payload, payloadIn[payloadType]);
                    break;
                case "formData":
                    formData = getParametersFromPayloadWithParamNames(payload, payloadIn[payloadType]);
                    break;
            }
        });
    }
    var headersObject = new Headers({});
    new Headers(headers).forEach(function (value, key) {
        headersObject.set(key, String(value));
    });
    var fetchOptions = Object.assign({}, { method: method, headers: headersObject });
    if (body && typeof body === "string") {
        fetchOptions.body = body;
    }
    else if (body && typeof body === "object" && Object.keys(body).length > 0) {
        fetchOptions.body = JSON.stringify(body);
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
