"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var readable_stream_1 = require("readable-stream");
var encode_1 = require("./encode");
var EncodeStream = /** @class */ (function (_super) {
    __extends(EncodeStream, _super);
    function EncodeStream(options) {
        if (options === void 0) { options = { useRunningStatus: true }; }
        var _this = _super.call(this, { objectMode: true }) || this;
        _this.runningStatus = null;
        _this.options = options;
        return _this;
    }
    EncodeStream.prototype.write = function (message, cb) {
        return _super.prototype.write.call(this, message, cb);
    };
    EncodeStream.prototype._transform = function (message, _enc, next) {
        var encoded = [];
        try {
            for (var _i = 0, _a = encode_1.encode(message); _i < _a.length; _i++) {
                var _b = _a[_i], status = _b[0], data = _b.slice(1);
                if (this.options.useRunningStatus) {
                    if (status != this.runningStatus) {
                        encoded.push(status);
                        this.runningStatus = status;
                    }
                }
                else {
                    encoded.push(status);
                }
                encoded.push.apply(encoded, data);
            }
            var buf = Buffer.from(encoded);
            return next(undefined, buf);
        }
        catch (error) {
            return next(error);
        }
    };
    return EncodeStream;
}(readable_stream_1.Transform));
exports.EncodeStream = EncodeStream;
