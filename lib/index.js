"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Status bytes are the only bytes that have the most significant bit set.
// MIDI Spec 1.0 Page 100, Table 1
// https://www.midi.org/specifications/item/table-1-summary-of-midi-message
var statusBytes = {
    // Channel voice messages
    // The second nibble is used to encode the channel (0-F).
    NoteOff: 0x80,
    NoteOn: 0x90,
    PolyKeyPressure: 0xa0,
    ControlChange: 0xb0,
    ProgramChange: 0xc0,
    ChannelKeyPressure: 0xd0,
    PitchBendChange: 0xe0,
    // System messages
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
