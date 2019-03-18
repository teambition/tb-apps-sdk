"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var base_1 = require("../../lib/api/base");
var HostAPI = /** @class */ (function (_super) {
    tslib_1.__extends(HostAPI, _super);
    function HostAPI() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HostAPI.prototype.isolatedAPI = function () {
        return ['isolatedMethod'];
    };
    HostAPI.prototype.isolatedMethod = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return this.call.apply(this, ['isolatedMethod'].concat(params));
    };
    HostAPI.prototype.test1 = function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        return this.call.apply(this, ['test1'].concat(params));
    };
    return HostAPI;
}(base_1.APIBase));
exports.hostAPI = function (sdk) {
    return base_1.factory(sdk, HostAPI);
};
