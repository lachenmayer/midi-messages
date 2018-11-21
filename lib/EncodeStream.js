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
        var _this = _super.call(this, { writableObjectMode: true }) || this;
        _this._runningStatus = null;
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
                    if (status != this._runningStatus) {
                        encoded.push(status);
                        this._runningStatus = status;
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
    //
    // Channel messages
    //
    // Channel voice messages
    EncodeStream.prototype.noteOff = function (channel, note, velocity) {
        this.write({ type: 'NoteOff', channel: channel, note: note, velocity: velocity });
    };
    EncodeStream.prototype.noteOn = function (channel, note, velocity) {
        this.write({ type: 'NoteOn', channel: channel, note: note, velocity: velocity });
    };
    EncodeStream.prototype.polyKeyPressure = function (channel, note, pressure) {
        this.write({ type: 'PolyKeyPressure', channel: channel, note: note, pressure: pressure });
    };
    EncodeStream.prototype.controlChange = function (channel, control, value) {
        this.write({ type: 'ControlChange', channel: channel, control: control, value: value });
    };
    EncodeStream.prototype.programChange = function (channel, number) {
        this.write({ type: 'ProgramChange', channel: channel, number: number });
    };
    EncodeStream.prototype.channelKeyPressure = function (channel, pressure) {
        this.write({ type: 'ChannelKeyPressure', channel: channel, pressure: pressure });
    };
    EncodeStream.prototype.pitchBendChange = function (channel, value) {
        this.write({ type: 'PitchBendChange', channel: channel, value: value });
    };
    EncodeStream.prototype.rpnChange = function (channel, parameter, value) {
        this.write({ type: 'RPNChange', channel: channel, parameter: parameter, value: value });
    };
    EncodeStream.prototype.nrpnChange = function (channel, parameter, value) {
        this.write({ type: 'NRPNChange', channel: channel, parameter: parameter, value: value });
    };
    // Channel mode messages
    EncodeStream.prototype.allSoundOff = function (channel) {
        this.write({ type: 'AllSoundOff', channel: channel });
    };
    EncodeStream.prototype.resetAllControllers = function (channel) {
        this.write({ type: 'ResetAllControllers', channel: channel });
    };
    EncodeStream.prototype.localControl = function (channel, value) {
        this.write({ type: 'LocalControl', channel: channel, value: value });
    };
    EncodeStream.prototype.allNotesOff = function (channel) {
        this.write({ type: 'AllNotesOff', channel: channel });
    };
    EncodeStream.prototype.omniOff = function (channel) {
        this.write({ type: 'OmniOff', channel: channel });
    };
    EncodeStream.prototype.omniOn = function (channel) {
        this.write({ type: 'OmniOn', channel: channel });
    };
    EncodeStream.prototype.monoMode = function (channel) {
        this.write({ type: 'MonoMode', channel: channel });
    };
    EncodeStream.prototype.polyMode = function (channel) {
        this.write({ type: 'PolyMode', channel: channel });
    };
    EncodeStream.prototype.sysEx = function (deviceId, data) {
        this.write({ type: 'SysEx', deviceId: deviceId, data: data });
    };
    EncodeStream.prototype.mtcQuarterFrame = function (data) {
        this.write({ type: 'MTCQuarterFrame', data: data });
    };
    EncodeStream.prototype.songPositionPointer = function (position) {
        this.write({ type: 'SongPositionPointer', position: position });
    };
    EncodeStream.prototype.songSelect = function (number) {
        this.write({ type: 'SongSelect', number: number });
    };
    EncodeStream.prototype.tuneRequest = function () {
        this.write({ type: 'TuneRequest' });
    };
    EncodeStream.prototype.timingClock = function () {
        this.write({ type: 'TimingClock' });
    };
    EncodeStream.prototype.start = function () {
        this.write({ type: 'Start' });
    };
    EncodeStream.prototype.continue = function () {
        this.write({ type: 'Continue' });
    };
    EncodeStream.prototype.stop = function () {
        this.write({ type: 'Stop' });
    };
    EncodeStream.prototype.activeSensing = function () {
        this.write({ type: 'ActiveSensing' });
    };
    EncodeStream.prototype.systemReset = function () {
        this.write({ type: 'SystemReset' });
    };
    return EncodeStream;
}(readable_stream_1.Transform));
exports.EncodeStream = EncodeStream;
