import {
  bool,
  channelVoiceStatus,
  controlNumbers,
  deviceId,
  eox,
  lsb,
  statusBytes,
  u14ToMsbLsb,
  u7,
} from './midi'

// Encodes a single MIDI message. Returns an array of encoded messages.
// The reason we return an array is that certain message types encode
// to multiple messages, ie. CC messages with fine-grained values.
export function encode(message: MIDIMessage): EncodedMessage[] {
  if (typeof message !== 'object') {
    throw new TypeError(`not a MIDI message: ${message}`)
  }
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
      ]
    }
    case 'NoteOn': {
      return [
        [
          channelVoiceStatus(statusBytes.NoteOn, message.channel),
          u7(message.note),
          u7(message.velocity),
        ],
      ]
    }
    case 'PolyKeyPressure': {
      return [
        [
          channelVoiceStatus(statusBytes.PolyKeyPressure, message.channel),
          u7(message.note),
          u7(message.pressure),
        ],
      ]
    }
    case 'ControlChange': {
      if (
        message.control >= 0 &&
        message.control <= 0b11111 &&
        message.value > 0x7f
      ) {
        // Encode a fine-grained CC message.
        const value = u14ToMsbLsb(message.value)
        return [
          cc(message.channel, message.control, value.msb),
          cc(message.channel, lsb(message.control), value.lsb),
        ]
      }
      return [cc(message.channel, message.control, message.value)]
    }
    case 'ProgramChange': {
      return [
        [
          channelVoiceStatus(statusBytes.ProgramChange, message.channel),
          u7(message.number),
        ],
      ]
    }
    case 'ChannelKeyPressure': {
      return [
        [
          channelVoiceStatus(statusBytes.ChannelKeyPressure, message.channel),
          u7(message.pressure),
        ],
      ]
    }
    case 'PitchBendChange': {
      const value = u14ToMsbLsb(message.value)
      return [
        [
          channelVoiceStatus(statusBytes.PitchBendChange, message.channel),
          value.lsb,
          value.msb,
        ],
      ]
    }
    case 'RPNChange': {
      const parameter = u14ToMsbLsb(message.parameter)
      const value = u14ToMsbLsb(message.value)
      return [
        cc(message.channel, controlNumbers.rpnMsb, parameter.msb),
        cc(message.channel, controlNumbers.rpnLsb, parameter.lsb),
        cc(message.channel, controlNumbers.dataEntryMsb, value.msb),
        cc(message.channel, lsb(controlNumbers.dataEntryMsb), value.lsb),
      ]
    }
    case 'NRPNChange': {
      const parameter = u14ToMsbLsb(message.parameter)
      const value = u14ToMsbLsb(message.value)
      return [
        cc(message.channel, controlNumbers.nrpnMsb, parameter.msb),
        cc(message.channel, controlNumbers.nrpnLsb, parameter.lsb),
        cc(message.channel, controlNumbers.dataEntryMsb, value.msb),
        cc(message.channel, lsb(controlNumbers.dataEntryMsb), value.lsb),
      ]
    }

    // Channel mode messages

    case 'AllSoundOff': {
      return [cc(message.channel, controlNumbers.AllSoundOff, 0)]
    }
    case 'ResetAllControllers': {
      return [cc(message.channel, controlNumbers.ResetAllControllers, 0)]
    }
    case 'LocalControl': {
      const value = bool(message.value)
      return [cc(message.channel, controlNumbers.LocalControl, value)]
    }
    case 'AllNotesOff': {
      return [cc(message.channel, controlNumbers.AllNotesOff, 0)]
    }
    case 'OmniOff': {
      return [cc(message.channel, controlNumbers.OmniOff, 0)]
    }
    case 'OmniOn': {
      return [cc(message.channel, controlNumbers.OmniOn, 0)]
    }
    case 'MonoMode': {
      return [cc(message.channel, controlNumbers.MonoMode, 0)]
    }
    case 'PolyMode': {
      return [cc(message.channel, controlNumbers.PolyMode, 0)]
    }

    //
    // System messages
    //

    case 'SysEx': {
      const data = message.data.map(n => u7(n))
      return [[statusBytes.SysEx, ...deviceId(message.deviceId), ...data, eox]]
    }

    case 'MTCQuarterFrame': {
      return [[statusBytes.MTCQuarterFrame, u7(message.data)]]
    }

    case 'SongPositionPointer': {
      const position = u14ToMsbLsb(message.position)
      return [[statusBytes.SongPositionPointer, position.lsb, position.msb]]
    }

    case 'SongSelect': {
      return [[statusBytes.SongSelect, u7(message.number)]]
    }

    case 'TuneRequest': {
      return [[statusBytes.TuneRequest]]
    }

    case 'TimingClock': {
      return [[statusBytes.TimingClock]]
    }

    case 'Start': {
      return [[statusBytes.Start]]
    }

    case 'Continue': {
      return [[statusBytes.Continue]]
    }

    case 'Stop': {
      return [[statusBytes.Stop]]
    }

    case 'ActiveSensing': {
      return [[statusBytes.ActiveSensing]]
    }

    case 'SystemReset': {
      return [[statusBytes.SystemReset]]
    }

    default: {
      return typeError(message)
    }
  }
}

function cc(channel: Channel, control: number, value: number): EncodedMessage {
  return [
    channelVoiceStatus(statusBytes.ControlChange, channel),
    u7(control),
    u7(value),
  ]
}

function typeError(message: never): never {
  throw new TypeError(`not a MIDI message: ${message}`)
}
