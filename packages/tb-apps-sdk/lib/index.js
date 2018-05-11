"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
exports.__esModule = true;
var ORIGIN_CI = 'http://project.ci';
var ORIGIN_PROD = 'https://www.teambition.com';
exports.notify = function (args) { return exports.callService(__assign({}, args, { method: 'essage' })); };
exports.callService = function (_a) {
    var isCI = _a.isCI, _b = _a.toOrigin, toOrigin = _b === void 0 ? isCI ? ORIGIN_CI : ORIGIN_PROD : _b, data = __rest(_a, ["isCI", "toOrigin"]);
    return window.parent.postMessage(JSON.parse(JSON.stringify(data)), toOrigin);
};
