"use strict";
// Status bytes are the only bytes that have the most significant bit set.
// MIDI Spec 1.0 Page 100, Table 1
// https://www.midi.org/specifications/item/table-1-summary-of-midi-message
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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Channel voice messages
// The second nibble is used to encode the channel (0-F).
var channelVoiceMessageStatusBytes = {
    NoteOff: 0x80,
    NoteOn: 0x90,
    PolyKeyPressure: 0xa0,
    ControlChange: 0xb0,
    ProgramChange: 0xc0,
    ChannelKeyPressure: 0xd0,
    PitchBendChange: 0xe0,
};
var systemMessageStatusBytes = {
    SysEx: 0xf0,
    MTCQuarterFrame: 0xf1,
    SongPositionPointer: 0xf2,
    SongSelect: 0xf3,
    TuneRequest: 0xf6,
    TimingClock: 0xf8,
    Start: 0xfa,
    Continue: 0xfb,
    Stop: 0xfc,
    ActiveSensing: 0xfe,
    SystemReset: 0xff,
};
var systemMessageTypes = invert(systemMessageStatusBytes);
var statusBytes = __assign({}, channelVoiceMessageStatusBytes, systemMessageStatusBytes);
// Control numbers for control change messages.
// This is not a complete list, see MIDI Spec 1.0 Page 102, Table 3
var controlNumbers = {
    dataEntryMsb: 0x06,
    nrpnMsb: 0x62,
    nrpnLsb: 0x63,
    rpnMsb: 0x64,
    rpnLsb: 0x65,
    // Channel mode messages
    AllSoundOff: 0x78,
    ResetAllControllers: 0x79,
    LocalControl: 0x7a,
    AllNotesOff: 0x7b,
    OmniOff: 0x7c,
    OmniOn: 0x7d,
    MonoMode: 0x7e,
    PolyMode: 0x7f,
};
// Indicates end of a sysex transmission.
var eox = 0xf7;
// Encodes a single MIDI message. Returns an array of encoded messages.
// The reason we return an array is that certain message types encode
// to multiple messages, ie. CC messages with fine-grained values.
function encode(message) {
    switch (message.type) {
        //
        // Channel messages
        //
        // Channel voice messages
        case 'NoteOff': {
            return [
                [
                    channelVoiceStatus(statusBytes.NoteOff, message.channel),
                    u7(message.note),
                    u7(message.velocity),
                ],
            ];
        }
        case 'NoteOn': {
            return [
                [
                    channelVoiceStatus(statusBytes.NoteOn, message.channel),
                    u7(message.note),
                    u7(message.velocity),
                ],
            ];
        }
        case 'PolyKeyPressure': {
            return [
                [
                    channelVoiceStatus(statusBytes.PolyKeyPressure, message.channel),
                    u7(message.note),
                    u7(message.pressure),
                ],
            ];
        }
        case 'ControlChange': {
            if (message.control >= 0 &&
                message.control <= 31 &&
                message.value > 0x7f) {
                // Encode a fine-grained CC message.
                var value = u14ToMsbLsb(message.value);
                return [
                    cc(message.channel, message.control, value.msb),
                    cc(message.channel, lsb(message.control), value.lsb),
                ];
            }
            return [cc(message.channel, message.control, message.value)];
        }
        case 'ProgramChange': {
            return [
                [
                    channelVoiceStatus(statusBytes.ProgramChange, message.channel),
                    u7(message.number),
                ],
            ];
        }
        case 'ChannelKeyPressure': {
            return [
                [
                    channelVoiceStatus(statusBytes.ChannelKeyPressure, message.channel),
                    u7(message.pressure),
                ],
            ];
        }
        case 'PitchBendChange': {
            var value = u14ToMsbLsb(message.value);
            return [
                [
                    channelVoiceStatus(statusBytes.PitchBendChange, message.channel),
                    value.lsb,
                    value.msb,
                ],
            ];
        }
        case 'RPNChange': {
            var parameter = u14ToMsbLsb(message.parameter);
            var value = u14ToMsbLsb(message.value);
            return [
                cc(message.channel, controlNumbers.rpnMsb, parameter.msb),
                cc(message.channel, controlNumbers.rpnLsb, parameter.lsb),
                cc(message.channel, controlNumbers.dataEntryMsb, value.msb),
                cc(message.channel, lsb(controlNumbers.dataEntryMsb), value.lsb),
            ];
        }
        case 'NRPNChange': {
            var parameter = u14ToMsbLsb(message.parameter);
            var value = u14ToMsbLsb(message.value);
            return [
                cc(message.channel, controlNumbers.nrpnMsb, parameter.msb),
                cc(message.channel, controlNumbers.nrpnLsb, parameter.lsb),
                cc(message.channel, controlNumbers.dataEntryMsb, value.msb),
                cc(message.channel, lsb(controlNumbers.dataEntryMsb), value.lsb),
            ];
        }
        // Channel mode messages
        case 'AllSoundOff': {
            return [cc(message.channel, controlNumbers.AllSoundOff, 0)];
        }
        case 'ResetAllControllers': {
            return [cc(message.channel, controlNumbers.ResetAllControllers, 0)];
        }
        case 'LocalControl': {
            var value = bool(message.value);
            return [cc(message.channel, controlNumbers.LocalControl, value)];
        }
        case 'AllNotesOff': {
            return [cc(message.channel, controlNumbers.AllNotesOff, 0)];
        }
        case 'OmniOff': {
            return [cc(message.channel, controlNumbers.OmniOff, 0)];
        }
        case 'OmniOn': {
            return [cc(message.channel, controlNumbers.OmniOn, 0)];
        }
        case 'MonoMode': {
            return [cc(message.channel, controlNumbers.MonoMode, 0)];
        }
        case 'PolyMode': {
            return [cc(message.channel, controlNumbers.PolyMode, 0)];
        }
        //
        // System messages
        //
        case 'SysEx': {
            var data = message.data.map(function (n) { return u7(n); });
            return [[statusBytes.SysEx].concat(deviceId(message.deviceId), data, [eox])];
        }
        case 'MTCQuarterFrame': {
            return [[statusBytes.MTCQuarterFrame, u7(message.data)]];
        }
        case 'SongPositionPointer': {
            var position = u14ToMsbLsb(message.position);
            return [[statusBytes.SongPositionPointer, position.lsb, position.msb]];
        }
        case 'SongSelect': {
            return [[statusBytes.SongSelect, u7(message.number)]];
        }
        case 'TuneRequest': {
            return [[statusBytes.TuneRequest]];
        }
        case 'TimingClock': {
            return [[statusBytes.TimingClock]];
        }
        case 'Start': {
            return [[statusBytes.Start]];
        }
        case 'Continue': {
            return [[statusBytes.Continue]];
        }
        case 'Stop': {
            return [[statusBytes.Stop]];
        }
        case 'ActiveSensing': {
            return [[statusBytes.ActiveSensing]];
        }
        case 'SystemReset': {
            return [[statusBytes.SystemReset]];
        }
        default: {
            return exhaustive(message);
        }
    }
}
exports.encode = encode;
function cc(channel, control, value) {
    return [
        channelVoiceStatus(statusBytes.ControlChange, channel),
        u7(control),
        u7(value),
    ];
}
function channelVoiceStatus(messageType, channel) {
    return messageType + u4(channel - 1);
}
// Returns the CC control number that sets the LSB (fine) value of the given control number.
function lsb(msbControlNumber) {
    return 0x20 + msbControlNumber;
}
function deviceId(id) {
    if (typeof id === 'number') {
        return [u7(id)];
    }
    else if (id.length === 1 || id.length === 3) {
        return id.map(function (n) { return u7(n); });
    }
    else {
        throw new TypeError("device id must be 1 byte or 3 bytes long. instead: " + id);
    }
}
function u4(n) {
    return n & 15;
}
function u7(n) {
    return n & 127;
}
function bool(b) {
    return b ? 127 : 0;
}
function u14ToMsbLsb(n) {
    return {
        msb: u7(n >> 7),
        lsb: u7(n),
    };
}
function exhaustive(message) {
    throw new TypeError("message not implemented: " + message);
}
function decode(buf) {
    var messages = [];
    var runningStatus = null;
    var i = 0;
    while (i < buf.length) {
        var statusByte = readStatusByte();
        if (isChannelVoiceMessage(statusByte)) {
            runningStatus = statusByte;
            readChannelVoiceMessage(statusByte);
        }
        else if (isSystemMessage(statusByte)) {
            runningStatus = null;
            readSystemMessage(statusByte);
        }
        else {
            throw new OutOfRangeError("byte at index " + i + " is not a byte: " + statusByte);
        }
    }
    var mergedMessages = mergeMsbLsbCCMessages(messages);
    return mergedMessages;
    function readStatusByte() {
        var statusByte = peek();
        assertByte(statusByte);
        if (isDataByte(statusByte)) {
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
                push({ type: type, channel: channel, note: note, velocity: velocity });
                break;
            }
            case 'NoteOn': {
                var note = readU7();
                var velocity = readU7();
                push({ type: type, channel: channel, note: note, velocity: velocity });
                break;
            }
            case 'PolyKeyPressure': {
                var note = readU7();
                var pressure = readU7();
                push({ type: type, channel: channel, note: note, pressure: pressure });
                break;
            }
            case 'ControlChange': {
                var control = readU7();
                var value = readU7();
                if (control == controlNumbers.AllSoundOff) {
                    push({ type: 'AllSoundOff', channel: channel });
                }
                else if (control == controlNumbers.ResetAllControllers) {
                    push({ type: 'ResetAllControllers', channel: channel });
                }
                else if (control == controlNumbers.LocalControl) {
                    push({
                        type: 'LocalControl',
                        channel: channel,
                        value: parseBool(value),
                    });
                }
                else if (control == controlNumbers.AllNotesOff) {
                    push({ type: 'AllNotesOff', channel: channel });
                }
                else if (control == controlNumbers.OmniOff) {
                    push({ type: 'OmniOff', channel: channel });
                }
                else if (control == controlNumbers.OmniOn) {
                    push({ type: 'OmniOn', channel: channel });
                }
                else if (control == controlNumbers.MonoMode) {
                    push({ type: 'MonoMode', channel: channel });
                }
                else if (control == controlNumbers.PolyMode) {
                    push({ type: 'PolyMode', channel: channel });
                }
                else {
                    push({ type: type, channel: channel, control: control, value: value });
                }
                break;
            }
            case 'ProgramChange': {
                var number = readU7();
                push({ type: type, channel: channel, number: number });
                break;
            }
            case 'ChannelKeyPressure': {
                var pressure = readU7();
                push({ type: type, channel: channel, pressure: pressure });
                break;
            }
            case 'PitchBendChange': {
                var value = readU14();
                push({ type: type, channel: channel, value: value });
                break;
            }
            default: {
                throw new InternalError("case not implemented: " + type);
            }
        }
    }
    function readSystemMessage(statusByte) {
        var type = systemMessageTypes[statusByte];
        switch (type) {
            case 'SysEx': {
                var deviceId_1 = readU7();
                var data = readSysExData();
                push({ type: type, deviceId: deviceId_1, data: data });
                break;
            }
            case 'MTCQuarterFrame': {
                var data = readU7();
                push({ type: type, data: data });
                break;
            }
            case 'SongPositionPointer': {
                var position = readU14();
                push({ type: type, position: position });
                break;
            }
            case 'SongSelect': {
                var number = readU7();
                push({ type: type, number: number });
                break;
            }
            case 'TuneRequest': {
                push({ type: type });
                break;
            }
            case 'TimingClock': {
                push({ type: type });
                break;
            }
            case 'Start': {
                push({ type: type });
                break;
            }
            case 'Continue': {
                push({ type: type });
                break;
            }
            case 'Stop': {
                push({ type: type });
                break;
            }
            case 'ActiveSensing': {
                push({ type: type });
                break;
            }
            case 'SystemReset': {
                push({ type: type });
                break;
            }
            default: {
                throw new InternalError("case not implemented: " + type);
            }
        }
    }
    function readSysExData() {
        var data = [];
        for (var byte = next(); byte != eox; byte = next()) {
            assertU7(byte);
            data.push(byte);
        }
        return data;
    }
    function readU14() {
        var lsb = next();
        var msb = next();
        return msbLsbToU14(msb, lsb);
    }
    function readU7() {
        var byte = next();
        assertU7(byte);
        return byte;
    }
    function push(message) {
        messages.push(message);
    }
    function peek() {
        return buf[i];
    }
    function next() {
        var next = buf[i];
        i++;
        return next;
    }
}
exports.decode = decode;
function mergeMsbLsbCCMessages(messages) {
    var mergedMessages = [];
    for (var i = 0; i < messages.length; i++) {
        var message = messages[i];
        // Only the first 32 CC messages are defined as MSB/LSB (coarse/fine) messages.
        if (message.type === 'ControlChange' && message.control < 32) {
            var lsbMessage = messages[i + 1];
            // If the next message sets the LSB (fine) value, merge the values.
            if (lsbMessage != null &&
                lsbMessage.type === 'ControlChange' &&
                lsbMessage.control === lsb(message.control)) {
                message.value = msbLsbToU14(message.value, lsbMessage.value);
                i++; // Skip the next message.
            }
        }
        mergedMessages.push(message);
    }
    return mergedMessages;
}
function parseChannelVoiceMessageStatus(byte) {
    for (var _i = 0, _a = Object.entries(channelVoiceMessageStatusBytes); _i < _a.length; _i++) {
        var _b = _a[_i], type = _b[0], statusByte = _b[1];
        if (byte >= statusByte && byte <= statusByte + 15) {
            var channel = u4(byte) + 1;
            return { type: type, channel: channel };
        }
    }
    throw new InternalError('should not attempt to parse channel voice message unless we know the byte is a channel voice message status byte.');
}
function isDataByte(byte) {
    return byte >= 0x00 && byte <= 0x7f;
}
function isChannelVoiceMessage(byte) {
    return byte >= 0x80 && byte <= 0xef;
}
function isSystemMessage(byte) {
    return byte >= 0xf0 && byte <= 0xff;
}
function parseBool(byte) {
    assertU7(byte);
    return byte >= 64;
}
function msbLsbToU14(msb, lsb) {
    assertU7(msb);
    assertU7(lsb);
    return (msb << 7) + lsb;
}
function assertU7(byte) {
    if (byte < 0 || byte > 127) {
        throw new OutOfRangeError("expected a data byte (U7), got: " + byte);
    }
}
function assertByte(byte) {
    if (byte < 0 || byte > 255) {
        throw new OutOfRangeError("expected a byte (0-FF), got: " + byte);
    }
}
var UnexpectedDataError = /** @class */ (function (_super) {
    __extends(UnexpectedDataError, _super);
    function UnexpectedDataError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return UnexpectedDataError;
}(Error));
var OutOfRangeError = /** @class */ (function (_super) {
    __extends(OutOfRangeError, _super);
    function OutOfRangeError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OutOfRangeError;
}(Error));
var InternalError = /** @class */ (function (_super) {
    __extends(InternalError, _super);
    function InternalError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return InternalError;
}(Error));
function invert(map) {
    var inverted = {};
    for (var _i = 0, _a = Object.entries(map); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        inverted[value] = key;
    }
    return inverted;
}
