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
var decode_1 = require("./decode");
var midi_1 = require("./midi");
var DecodeStream = /** @class */ (function (_super) {
    __extends(DecodeStream, _super);
    function DecodeStream() {
        var _this = _super.call(this, { readableObjectMode: true }) || this;
        _this._mergedCCMessages = [];
        _this._onmessage = function (message) {
            // If a CC message that could be interpreted as MSB/LSB is emitted,
            // wait for the next message - if it's the corresponding LSB message,
            // emit a merged message. If not, emits the CC message once the next message
            // is emitted.
            if (message.type === 'ControlChange' && message.control < 32) {
                // Only the first 32 CC messages are defined as MSB/LSB (coarse/fine) messages.
                _this._mergedCCMessages.push(message);
            }
            else if (_this._mergedCCMessages.length > 0 &&
                message.type === 'ControlChange' &&
                message.control ===
                    midi_1.lsb(_this._mergedCCMessages[_this._mergedCCMessages.length - 1].control)) {
                var msbMessage = _this._mergedCCMessages.pop();
                if (typeof msbMessage === 'undefined') {
                    // this._mergedCCMessages.length > 0, so this can not happen.
                    throw new Error('invariant error');
                }
                msbMessage.value = midi_1.msbLsbToU14(msbMessage.value, message.value);
                _this.push(msbMessage);
            }
            else {
                _this.push(message);
            }
        };
        return _this;
    }
    DecodeStream.prototype.write = function (chunk, cb) {
        return _super.prototype.write.call(this, Buffer.from(chunk), cb);
    };
    DecodeStream.prototype._transform = function (chunk, _enc, cb) {
        try {
            decode_1.decode(chunk, this._onmessage);
            for (var _i = 0, _a = this._mergedCCMessages; _i < _a.length; _i++) {
                var message = _a[_i];
                this.push(message);
            }
            this._mergedCCMessages = [];
            cb(undefined);
        }
        catch (error) {
            cb(error);
        }
    };
    return DecodeStream;
}(readable_stream_1.Transform));
exports.DecodeStream = DecodeStream;
