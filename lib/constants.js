"use strict";
// Status bytes are the only bytes that have the most significant bit set.
// MIDI Spec 1.0 Page 100, Table 1
// https://www.midi.org/specifications/item/table-1-summary-of-midi-message
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
function invert(map) {
    var inverted = {};
    for (var _i = 0, _a = Object.entries(map); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        inverted[value] = key;
    }
    return inverted;
}
