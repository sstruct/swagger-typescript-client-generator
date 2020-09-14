"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withHeaders = void 0;
exports.withHeaders = function (requestFactory, overrideHeaders) {
    return function (_a) {
        var path = _a.path, query = _a.query, body = _a.body, formData = _a.formData, headers = _a.headers, method = _a.method, configuration = _a.configuration;
        var headersObject = new Headers(headers || {});
        new Headers(overrideHeaders).forEach(function (value, key) {
            headersObject.set(key, String(value));
        });
        return requestFactory({
            path: path,
            query: query,
            body: body,
            formData: formData,
            headers: headersObject,
            method: method,
            configuration: configuration,
        });
    };
};
