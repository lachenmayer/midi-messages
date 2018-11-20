"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var midi_1 = require("./midi");
// Encodes a single MIDI message. Returns an array of encoded messages.
// The reason we return an array is that certain message types encode
// to multiple messages, ie. CC messages with fine-grained values.
function encode(message) {
    if (typeof message !== 'object') {
        throw new TypeError("not a MIDI message: " + message);
    }
    switch (message.type) {
        //
        // Channel messages
        //
        // Channel voice messages
        case 'NoteOff': {
            return [
                [
                    midi_1.channelVoiceStatus(midi_1.statusBytes.NoteOff, message.channel),
                    midi_1.u7(message.note),
                    midi_1.u7(message.velocity),
                ],
            ];
        }
        case 'NoteOn': {
            return [
                [
                    midi_1.channelVoiceStatus(midi_1.statusBytes.NoteOn, message.channel),
                    midi_1.u7(message.note),
                    midi_1.u7(message.velocity),
                ],
            ];
        }
        case 'PolyKeyPressure': {
            return [
                [
                    midi_1.channelVoiceStatus(midi_1.statusBytes.PolyKeyPressure, message.channel),
                    midi_1.u7(message.note),
                    midi_1.u7(message.pressure),
                ],
            ];
        }
        case 'ControlChange': {
            if (message.control >= 0 &&
                message.control <= 31 &&
                message.value > 0x7f) {
                // Encode a fine-grained CC message.
                var value = midi_1.u14ToMsbLsb(message.value);
                return [
                    cc(message.channel, message.control, value.msb),
                    cc(message.channel, midi_1.lsb(message.control), value.lsb),
                ];
            }
            return [cc(message.channel, message.control, message.value)];
        }
        case 'ProgramChange': {
            return [
                [
                    midi_1.channelVoiceStatus(midi_1.statusBytes.ProgramChange, message.channel),
                    midi_1.u7(message.number),
                ],
            ];
        }
        case 'ChannelKeyPressure': {
            return [
                [
                    midi_1.channelVoiceStatus(midi_1.statusBytes.ChannelKeyPressure, message.channel),
                    midi_1.u7(message.pressure),
                ],
            ];
        }
        case 'PitchBendChange': {
            var value = midi_1.u14ToMsbLsb(message.value);
            return [
                [
                    midi_1.channelVoiceStatus(midi_1.statusBytes.PitchBendChange, message.channel),
                    value.lsb,
                    value.msb,
                ],
            ];
        }
        case 'RPNChange': {
            var parameter = midi_1.u14ToMsbLsb(message.parameter);
            var value = midi_1.u14ToMsbLsb(message.value);
            return [
                cc(message.channel, midi_1.controlNumbers.rpnMsb, parameter.msb),
                cc(message.channel, midi_1.controlNumbers.rpnLsb, parameter.lsb),
                cc(message.channel, midi_1.controlNumbers.dataEntryMsb, value.msb),
                cc(message.channel, midi_1.lsb(midi_1.controlNumbers.dataEntryMsb), value.lsb),
            ];
        }
        case 'NRPNChange': {
            var parameter = midi_1.u14ToMsbLsb(message.parameter);
            var value = midi_1.u14ToMsbLsb(message.value);
            return [
                cc(message.channel, midi_1.controlNumbers.nrpnMsb, parameter.msb),
                cc(message.channel, midi_1.controlNumbers.nrpnLsb, parameter.lsb),
                cc(message.channel, midi_1.controlNumbers.dataEntryMsb, value.msb),
                cc(message.channel, midi_1.lsb(midi_1.controlNumbers.dataEntryMsb), value.lsb),
            ];
        }
        // Channel mode messages
        case 'AllSoundOff': {
            return [cc(message.channel, midi_1.controlNumbers.AllSoundOff, 0)];
        }
        case 'ResetAllControllers': {
            return [cc(message.channel, midi_1.controlNumbers.ResetAllControllers, 0)];
        }
        case 'LocalControl': {
            var value = midi_1.bool(message.value);
            return [cc(message.channel, midi_1.controlNumbers.LocalControl, value)];
        }
        case 'AllNotesOff': {
            return [cc(message.channel, midi_1.controlNumbers.AllNotesOff, 0)];
        }
        case 'OmniOff': {
            return [cc(message.channel, midi_1.controlNumbers.OmniOff, 0)];
        }
        case 'OmniOn': {
            return [cc(message.channel, midi_1.controlNumbers.OmniOn, 0)];
        }
        case 'MonoMode': {
            return [cc(message.channel, midi_1.controlNumbers.MonoMode, 0)];
        }
        case 'PolyMode': {
            return [cc(message.channel, midi_1.controlNumbers.PolyMode, 0)];
        }
        //
        // System messages
        //
        case 'SysEx': {
            var data = message.data.map(function (n) { return midi_1.u7(n); });
            return [[midi_1.statusBytes.SysEx].concat(midi_1.deviceId(message.deviceId), data, [midi_1.eox])];
        }
        case 'MTCQuarterFrame': {
            return [[midi_1.statusBytes.MTCQuarterFrame, midi_1.u7(message.data)]];
        }
        case 'SongPositionPointer': {
            var position = midi_1.u14ToMsbLsb(message.position);
            return [[midi_1.statusBytes.SongPositionPointer, position.lsb, position.msb]];
        }
        case 'SongSelect': {
            return [[midi_1.statusBytes.SongSelect, midi_1.u7(message.number)]];
        }
        case 'TuneRequest': {
            return [[midi_1.statusBytes.TuneRequest]];
        }
        case 'TimingClock': {
            return [[midi_1.statusBytes.TimingClock]];
        }
        case 'Start': {
            return [[midi_1.statusBytes.Start]];
        }
        case 'Continue': {
            return [[midi_1.statusBytes.Continue]];
        }
        case 'Stop': {
            return [[midi_1.statusBytes.Stop]];
        }
        case 'ActiveSensing': {
            return [[midi_1.statusBytes.ActiveSensing]];
        }
        case 'SystemReset': {
            return [[midi_1.statusBytes.SystemReset]];
        }
        default: {
            return typeError(message);
        }
    }
}
exports.encode = encode;
function cc(channel, control, value) {
    return [
        midi_1.channelVoiceStatus(midi_1.statusBytes.ControlChange, channel),
        midi_1.u7(control),
        midi_1.u7(value),
    ];
}
function typeError(message) {
    throw new TypeError("not a MIDI message: " + message);
}
