// Status bytes are the only bytes that have the most significant bit set.
// MIDI Spec 1.0 Page 100, Table 1
const statusBytes = {
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
}

// Control numbers for control change messages.
// This is not a complete list, see MIDI Spec 1.0 Page 102, Table 3
const controlNumbers = {
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
}

// Indicates end of a sysex transmission.
const eox = 0xf7

// Encodes a single MIDI message.
export function encode(message: MIDIMessage): number[] {
  switch (message.type) {
    //
    // Channel messages
    //

    // Channel voice messages

    case 'NoteOff': {
      return [
        channelVoiceStatus(statusBytes.NoteOff, message.channel),
        u7(message.velocity),
      ]
    }
    case 'NoteOn': {
      return [
        channelVoiceStatus(statusBytes.NoteOn, message.channel),
        u7(message.note),
        u7(message.velocity),
      ]
    }
    case 'PolyKeyPressure': {
      return [
        channelVoiceStatus(statusBytes.PolyKeyPressure, message.channel),
        u7(message.note),
        u7(message.pressure),
      ]
    }
    case 'ControlChange': {
      return cc(message.channel, message.control, message.value)
    }
    case 'ControlChange14': {
      if (message.control < 0 || message.control > 0b11111) {
        throw new TypeError(
          'Fine (MSB+LSB) control messages are only defined for controller numbers 0 - 31.'
        )
      }
      const value = u14ToMsbLsb(message.value)
      return [
        ...cc(message.channel, message.control, value.msb),
        ...cc(message.channel, lsb(message.control), value.lsb),
      ]
    }
    case 'ProgramChange': {
      return [
        channelVoiceStatus(statusBytes.ProgramChange, message.channel),
        u7(message.number),
      ]
    }
    case 'ChannelKeyPressure': {
      return [
        channelVoiceStatus(statusBytes.ChannelKeyPressure, message.channel),
        u7(message.pressure),
      ]
    }
    case 'PitchBendChange': {
      const value = u14ToMsbLsb(message.value)
      return [
        channelVoiceStatus(statusBytes.PitchBendChange, message.channel),
        value.lsb,
        value.msb,
      ]
    }
    case 'RPNChange': {
      const parameter = u14ToMsbLsb(message.parameter)
      const value = u14ToMsbLsb(message.value)
      return [
        ...cc(message.channel, controlNumbers.rpnMsb, parameter.msb),
        ...cc(message.channel, controlNumbers.rpnLsb, parameter.lsb),
        ...cc(message.channel, controlNumbers.dataEntryMsb, value.msb),
        ...cc(message.channel, lsb(controlNumbers.dataEntryMsb), value.lsb),
      ]
    }
    case 'NRPNChange': {
      const parameter = u14ToMsbLsb(message.parameter)
      const value = u14ToMsbLsb(message.value)
      return [
        ...cc(message.channel, controlNumbers.nrpnMsb, parameter.msb),
        ...cc(message.channel, controlNumbers.nrpnLsb, parameter.lsb),
        ...cc(message.channel, controlNumbers.dataEntryMsb, value.msb),
        ...cc(message.channel, lsb(controlNumbers.dataEntryMsb), value.lsb),
      ]
    }

    // Channel mode messages

    case 'AllSoundOff': {
      return cc(message.channel, controlNumbers.AllSoundOff, 0)
    }
    case 'ResetAllControllers': {
      return cc(message.channel, controlNumbers.ResetAllControllers, 0)
    }
    case 'LocalControl': {
      const value = bool(message.value)
      return cc(message.channel, controlNumbers.LocalControl, value)
    }
    case 'AllNotesOff': {
      return cc(message.channel, controlNumbers.AllNotesOff, 0)
    }
    case 'OmniOff': {
      return cc(message.channel, controlNumbers.OmniOff, 0)
    }
    case 'OmniOn': {
      return cc(message.channel, controlNumbers.OmniOn, 0)
    }
    case 'MonoMode': {
      return cc(message.channel, controlNumbers.MonoMode, 0)
    }
    case 'PolyMode': {
      return cc(message.channel, controlNumbers.PolyMode, 0)
    }

    //
    // System messages
    //

    case 'SysEx': {
      const data = message.data.map(n => u7(n))
      return [statusBytes.SysEx, u7(message.deviceId), ...data, eox]
    }

    case 'MTCQuarterFrame': {
      return [statusBytes.MTCQuarterFrame, u7(message.data)]
    }

    case 'SongPositionPointer': {
      const position = u14ToMsbLsb(message.position)
      return [statusBytes.SongPositionPointer, position.lsb, position.msb]
    }

    case 'SongSelect': {
      return [statusBytes.SongSelect, u7(message.number)]
    }

    case 'TuneRequest': {
      return [statusBytes.TuneRequest]
    }

    case 'TimingClock': {
      return [statusBytes.TimingClock]
    }

    case 'Start': {
      return [statusBytes.Start]
    }

    case 'Continue': {
      return [statusBytes.Continue]
    }

    case 'Stop': {
      return [statusBytes.Stop]
    }

    case 'ActiveSensing': {
      return [statusBytes.ActiveSensing]
    }

    case 'SystemReset': {
      return [statusBytes.SystemReset]
    }

    default: {
      return exhaustive(message)
    }
  }
}

function cc(channel: Channel, control: number, value: number): number[] {
  return [
    channelVoiceStatus(statusBytes.ControlChange, channel),
    u7(control),
    u7(value),
  ]
}

function channelVoiceStatus(messageType: number, channel: Channel): number {
  if (channel < 1 || channel > 16) {
    throw new TypeError(`encodeStatus: invalid channel: ${channel}`)
  }
  return messageType + u4(channel - 1)
}

function u4(n: number): number {
  return n & 0b00001111
}

function u7(n: number): number {
  return n & 0b01111111
}

function bool(b: boolean): number {
  return b ? 0b01111111 : 0
}

function u14ToMsbLsb(n: number): { msb: number; lsb: number } {
  return {
    msb: u7(n >> 7),
    lsb: u7(n),
  }
}

function lsb(msbControlNumber: number) {
  return 0x20 + msbControlNumber
}

function exhaustive(message: never): never {
  throw new TypeError(`message not implemented: ${message}`)
}
