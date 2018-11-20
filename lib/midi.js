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
exports.channelVoiceMessageStatusBytes = {
    NoteOff: 0x80,
    NoteOn: 0x90,
    PolyKeyPressure: 0xa0,
    ControlChange: 0xb0,
    ProgramChange: 0xc0,
    ChannelKeyPressure: 0xd0,
    PitchBendChange: 0xe0,
};
exports.systemMessageStatusBytes = {
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
exports.systemMessageTypes = invert(exports.systemMessageStatusBytes);
exports.statusBytes = __assign({}, exports.channelVoiceMessageStatusBytes, exports.systemMessageStatusBytes);
// Control numbers for control change messages.
// This is not a complete list, see MIDI Spec 1.0 Page 102, Table 3
exports.controlNumbers = {
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
exports.eox = 0xf7;
// Encodes a channel into the lower nibble of a channel voice message status byte.
// Status byte must have all 4 low bits unset.
function channelVoiceStatus(statusByte, channel) {
    return statusByte + u4(channel - 1);
}
exports.channelVoiceStatus = channelVoiceStatus;
// Returns the CC control number that sets the LSB (fine) value of the given control number.
function lsb(msbControlNumber) {
    return 0x20 + msbControlNumber;
}
exports.lsb = lsb;
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
exports.deviceId = deviceId;
function u4(n) {
    return n & 15;
}
exports.u4 = u4;
function u7(n) {
    return n & 127;
}
exports.u7 = u7;
function bool(b) {
    return b ? 127 : 0;
}
exports.bool = bool;
function u14ToMsbLsb(n) {
    return {
        msb: u7(n >> 7),
        lsb: u7(n),
    };
}
exports.u14ToMsbLsb = u14ToMsbLsb;
function isDataByte(byte) {
    return byte >= 0x00 && byte <= 0x7f;
}
exports.isDataByte = isDataByte;
function isChannelVoiceMessage(byte) {
    return byte >= 0x80 && byte <= 0xef;
}
exports.isChannelVoiceMessage = isChannelVoiceMessage;
function isSystemMessage(byte) {
    return byte >= 0xf0 && byte <= 0xff;
}
exports.isSystemMessage = isSystemMessage;
function parseBool(byte) {
    assertU7(byte);
    return byte >= 64;
}
exports.parseBool = parseBool;
function msbLsbToU14(msb, lsb) {
    assertU7(msb);
    assertU7(lsb);
    return (msb << 7) + lsb;
}
exports.msbLsbToU14 = msbLsbToU14;
function assertU7(byte) {
    if (byte < 0 || byte > 127) {
        throw new OutOfRangeError("expected a data byte (U7), got: " + byte);
    }
}
exports.assertU7 = assertU7;
function assertByte(byte) {
    if (byte < 0 || byte > 255) {
        throw new OutOfRangeError("expected a byte (0-FF), got: " + byte);
    }
}
exports.assertByte = assertByte;
var OutOfRangeError = /** @class */ (function (_super) {
    __extends(OutOfRangeError, _super);
    function OutOfRangeError() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OutOfRangeError;
}(Error));
function invert(map) {
    var inverted = {};
    for (var _i = 0, _a = Object.entries(map); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        inverted[value] = key;
    }
    return inverted;
}
