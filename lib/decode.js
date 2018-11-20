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
var midi_1 = require("./midi");
function decode(buf, onmessage) {
    var runningStatus = null;
    var i = 0;
    while (i < buf.length) {
        var statusByte = readStatusByte();
        if (midi_1.isChannelVoiceMessage(statusByte)) {
            runningStatus = statusByte;
            readChannelVoiceMessage(statusByte);
        }
        else if (midi_1.isSystemMessage(statusByte)) {
            runningStatus = null;
            readSystemMessage(statusByte);
        }
    }
    function readStatusByte() {
        var statusByte = peek();
        midi_1.assertByte(statusByte);
        if (midi_1.isDataByte(statusByte)) {
            if (runningStatus != null) {
                statusByte = runningStatus;
            }
            else {
                throw new UnexpectedDataError("did not expect data at index " + i + ": " + statusByte);
            }
        }
        else {
            statusByte = next();
        }
        return statusByte;
    }
    function readChannelVoiceMessage(statusByte) {
        var _a = parseChannelVoiceMessageStatus(statusByte), type_ = _a.type, channel = _a.channel;
        // This constraint should be in parseChannelVoiceMessageStatus return type,
        // but Object.entries loses this constraint unfortunately.
        var type = type_;
        switch (type) {
            case 'NoteOff': {
                var note = readU7();
                var velocity = readU7();
                onmessage({ type: type, channel: channel, note: note, velocity: velocity });
                break;
            }
            case 'NoteOn': {
                var note = readU7();
                var velocity = readU7();
                onmessage({ type: type, channel: channel, note: note, velocity: velocity });
                break;
            }
            case 'PolyKeyPressure': {
                var note = readU7();
                var pressure = readU7();
                onmessage({ type: type, channel: channel, note: note, pressure: pressure });
                break;
            }
            case 'ControlChange': {
                var control = readU7();
                var value = readU7();
                if (control == midi_1.controlNumbers.AllSoundOff) {
                    onmessage({ type: 'AllSoundOff', channel: channel });
                }
                else if (control == midi_1.controlNumbers.ResetAllControllers) {
                    onmessage({ type: 'ResetAllControllers', channel: channel });
                }
                else if (control == midi_1.controlNumbers.LocalControl) {
                    onmessage({
                        type: 'LocalControl',
                        channel: channel,
                        value: midi_1.parseBool(value),
                    });
                }
                else if (control == midi_1.controlNumbers.AllNotesOff) {
                    onmessage({ type: 'AllNotesOff', channel: channel });
                }
                else if (control == midi_1.controlNumbers.OmniOff) {
                    onmessage({ type: 'OmniOff', channel: channel });
                }
                else if (control == midi_1.controlNumbers.OmniOn) {
                    onmessage({ type: 'OmniOn', channel: channel });
                }
                else if (control == midi_1.controlNumbers.MonoMode) {
                    onmessage({ type: 'MonoMode', channel: channel });
                }
                else if (control == midi_1.controlNumbers.PolyMode) {
                    onmessage({ type: 'PolyMode', channel: channel });
                }
                else {
                    onmessage({ type: type, channel: channel, control: control, value: value });
                }
                break;
            }
            case 'ProgramChange': {
                var number = readU7();
                onmessage({ type: type, channel: channel, number: number });
                break;
            }
            case 'ChannelKeyPressure': {
                var pressure = readU7();
                onmessage({ type: type, channel: channel, pressure: pressure });
                break;
            }
            case 'PitchBendChange': {
                var value = readU14();
                onmessage({ type: type, channel: channel, value: value });
                break;
            }
            default: {
                throw new InternalError("case not implemented: " + type);
            }
        }
    }
    function readSystemMessage(statusByte) {
        var type = midi_1.systemMessageTypes[statusByte];
        switch (type) {
            case 'SysEx': {
                var deviceId = readU7();
                var data = readSysExData();
                onmessage({ type: type, deviceId: deviceId, data: data });
                break;
            }
            case 'MTCQuarterFrame': {
                var data = readU7();
                onmessage({ type: type, data: data });
                break;
            }
            case 'SongPositionPointer': {
                var position = readU14();
                onmessage({ type: type, position: position });
                break;
            }
            case 'SongSelect': {
                var number = readU7();
                onmessage({ type: type, number: number });
                break;
            }
            case 'TuneRequest': {
                onmessage({ type: type });
                break;
            }
            case 'TimingClock': {
                onmessage({ type: type });
                break;
            }
            case 'Start': {
                onmessage({ type: type });
                break;
            }
            case 'Continue': {
                onmessage({ type: type });
                break;
            }
            case 'Stop': {
                onmessage({ type: type });
                break;
            }
            case 'ActiveSensing': {
                onmessage({ type: type });
                break;
            }
            case 'SystemReset': {
                onmessage({ type: type });
                break;
            }
            default: {
                throw new InternalError("case not implemented: " + type);
            }
        }
    }
    function readSysExData() {
        var data = [];
        for (var byte = next(); byte != midi_1.eox; byte = next()) {
            midi_1.assertU7(byte);
            data.push(byte);
        }
        return data;
    }
    function readU14() {
        var lsb = next();
        var msb = next();
        return midi_1.msbLsbToU14(msb, lsb);
    }
    function readU7() {
        var byte = next();
        midi_1.assertU7(byte);
        return byte;
    }
    function peek() {
        return buf[i];
    }
    function next() {
        var next = buf[i];
        if (typeof next === 'undefined') {
            throw new UnexpectedEOFError();
        }
        i++;
        return next;
    }
}
exports.decode = decode;
function parseChannelVoiceMessageStatus(byte) {
    for (var _i = 0, _a = Object.entries(midi_1.channelVoiceMessageStatusBytes); _i < _a.length; _i++) {
        var _b = _a[_i], type = _b[0], statusByte = _b[1];
        if (byte >= statusByte && byte <= statusByte + 15) {
            var channel = midi_1.u4(byte) + 1;
            return { type: type, channel: channel };
        }
    }
    throw new InternalError('should not attempt to parse channel voice message unless we know the byte is a channel voice message status byte.');
}
var UnexpectedDataError = /** @class */ (function (_super) {
    __extends(UnexpectedDataError, _super);
    function UnexpectedDataError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'UnexpectedDataError';
        return _this;
    }
    return UnexpectedDataError;
}(Error));
var UnexpectedEOFError = /** @class */ (function (_super) {
    __extends(UnexpectedEOFError, _super);
    function UnexpectedEOFError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'UnexpectedEOFError';
        return _this;
    }
    return UnexpectedEOFError;
}(Error));
var InternalError = /** @class */ (function (_super) {
    __extends(InternalError, _super);
    function InternalError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = 'InternalError';
        return _this;
    }
    return InternalError;
}(Error));
