// Status bytes are the only bytes that have the most significant bit set.
// MIDI Spec 1.0 Page 100, Table 1
// https://www.midi.org/specifications/item/table-1-summary-of-midi-message

// Channel voice messages
// The second nibble is used to encode the channel (0-F).
const channelVoiceMessageStatusBytes: {
  [type in MIDIChannelVoiceMessage['type']]: number
} = {
  NoteOff: 0x80,
  NoteOn: 0x90,
  PolyKeyPressure: 0xa0,
  ControlChange: 0xb0,
  ProgramChange: 0xc0,
  ChannelKeyPressure: 0xd0,
  PitchBendChange: 0xe0,
}

const systemMessageStatusBytes: {
  [type in MIDISystemMessage['type']]: number
} = {
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
const systemMessageTypes = invert(systemMessageStatusBytes)

const statusBytes = {
  ...channelVoiceMessageStatusBytes,
  ...systemMessageStatusBytes,
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

// Encodes a single MIDI message. Returns an array of encoded messages.
// The reason we return an array is that certain message types encode
// to multiple messages, ie. CC messages with fine-grained values.
export function encode(message: MIDIMessage): EncodedMessage[] {
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
      return exhaustive(message)
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

function channelVoiceStatus(messageType: number, channel: Channel): number {
  return messageType + u4(channel - 1)
}

// Returns the CC control number that sets the LSB (fine) value of the given control number.
function lsb(msbControlNumber: number) {
  return 0x20 + msbControlNumber
}

function deviceId(id: SysExDeviceID) {
  if (typeof id === 'number') {
    return [u7(id)]
  } else if (id.length === 1 || id.length === 3) {
    return id.map(n => u7(n))
  } else {
    throw new TypeError(
      `device id must be 1 byte or 3 bytes long. instead: ${id}`
    )
  }
}

function u4(n: number): U4 {
  return n & 0b0000_1111
}

function u7(n: number): U7 {
  return n & 0b0111_1111
}

function bool(b: boolean): U7 {
  return b ? 0b0111_1111 : 0
}

function u14ToMsbLsb(n: U14): { msb: U7; lsb: U7 } {
  return {
    msb: u7(n >> 7),
    lsb: u7(n),
  }
}

function exhaustive(message: never): never {
  throw new TypeError(`message not implemented: ${message}`)
}

export function decode(buf: BufferLike): MIDIMessage[] {
  let messages: MIDIMessage[] = []
  let runningStatus: number | null = null
  let i = 0

  while (i < buf.length) {
    const statusByte = readStatusByte()
    if (isChannelVoiceMessage(statusByte)) {
      runningStatus = statusByte
      readChannelVoiceMessage(statusByte)
    } else if (isSystemMessage(statusByte)) {
      runningStatus = null
      readSystemMessage(statusByte)
    } else {
      throw new OutOfRangeError(
        `byte at index ${i} is not a byte: ${statusByte}`
      )
    }
  }

  const mergedMessages = mergeMsbLsbCCMessages(messages)

  return mergedMessages

  function readStatusByte() {
    let statusByte = peek()
    assertByte(statusByte)
    if (isDataByte(statusByte)) {
      if (runningStatus != null) {
        statusByte = runningStatus
      } else {
        throw new UnexpectedDataError(
          `did not expect data at index ${i}: ${statusByte}`
        )
      }
    } else {
      statusByte = next()
    }
    return statusByte
  }

  function readChannelVoiceMessage(statusByte: number) {
    const { type: type_, channel } = parseChannelVoiceMessageStatus(statusByte)
    // This constraint should be in parseChannelVoiceMessageStatus return type,
    // but Object.entries loses this constraint unfortunately.
    const type = type_ as MIDIChannelVoiceMessage['type']
    switch (type) {
      case 'NoteOff': {
        const note = readU7()
        const velocity = readU7()
        push({ type, channel, note, velocity })
        break
      }
      case 'NoteOn': {
        const note = readU7()
        const velocity = readU7()
        push({ type, channel, note, velocity })
        break
      }
      case 'PolyKeyPressure': {
        const note = readU7()
        const pressure = readU7()
        push({ type, channel, note, pressure })
        break
      }
      case 'ControlChange': {
        const control = readU7()
        const value = readU7()
        if (control == controlNumbers.AllSoundOff) {
          push({ type: 'AllSoundOff', channel })
        } else if (control == controlNumbers.ResetAllControllers) {
          push({ type: 'ResetAllControllers', channel })
        } else if (control == controlNumbers.LocalControl) {
          push({
            type: 'LocalControl',
            channel,
            value: parseBool(value),
          })
        } else if (control == controlNumbers.AllNotesOff) {
          push({ type: 'AllNotesOff', channel })
        } else if (control == controlNumbers.OmniOff) {
          push({ type: 'OmniOff', channel })
        } else if (control == controlNumbers.OmniOn) {
          push({ type: 'OmniOn', channel })
        } else if (control == controlNumbers.MonoMode) {
          push({ type: 'MonoMode', channel })
        } else if (control == controlNumbers.PolyMode) {
          push({ type: 'PolyMode', channel })
        } else {
          push({ type, channel, control, value })
        }
        break
      }
      case 'ProgramChange': {
        const number = readU7()
        push({ type, channel, number })
        break
      }
      case 'ChannelKeyPressure': {
        const pressure = readU7()
        push({ type, channel, pressure })
        break
      }
      case 'PitchBendChange': {
        const value = readU14()
        push({ type, channel, value })
        break
      }
      default: {
        throw new InternalError(`case not implemented: ${type}`)
      }
    }
  }

  function readSystemMessage(statusByte: number) {
    const type = systemMessageTypes[statusByte] as MIDISystemMessage['type']
    switch (type) {
      case 'SysEx': {
        const deviceId = readU7()
        const data = readSysExData()
        push({ type, deviceId, data })
        break
      }
      case 'MTCQuarterFrame': {
        const data = readU7()
        push({ type, data })
        break
      }
      case 'SongPositionPointer': {
        const position = readU14()
        push({ type, position })
        break
      }
      case 'SongSelect': {
        const number = readU7()
        push({ type, number })
        break
      }
      case 'TuneRequest': {
        push({ type })
        break
      }
      case 'TimingClock': {
        push({ type })
        break
      }
      case 'Start': {
        push({ type })
        break
      }
      case 'Continue': {
        push({ type })
        break
      }
      case 'Stop': {
        push({ type })
        break
      }
      case 'ActiveSensing': {
        push({ type })
        break
      }
      case 'SystemReset': {
        push({ type })
        break
      }
      default: {
        throw new InternalError(`case not implemented: ${type}`)
      }
    }
  }

  function readSysExData() {
    const data = []
    for (let byte = next(); byte != eox; byte = next()) {
      assertU7(byte)
      data.push(byte)
    }
    return data
  }

  function readU14(): U14 {
    const lsb = next()
    const msb = next()
    return msbLsbToU14(msb, lsb)
  }

  function readU7(): U7 {
    const byte = next()
    assertU7(byte)
    return byte
  }

  function push(message: MIDIMessage) {
    messages.push(message)
  }

  function peek() {
    return buf[i]
  }

  function next() {
    const next = buf[i]
    i++
    return next
  }
}

function mergeMsbLsbCCMessages(messages: MIDIMessage[]): MIDIMessage[] {
  const mergedMessages = []
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    // Only the first 32 CC messages are defined as MSB/LSB (coarse/fine) messages.
    if (message.type === 'ControlChange' && message.control < 32) {
      const lsbMessage = messages[i + 1]
      // If the next message sets the LSB (fine) value, merge the values.
      if (
        lsbMessage != null &&
        lsbMessage.type === 'ControlChange' &&
        lsbMessage.control === lsb(message.control)
      ) {
        message.value = msbLsbToU14(message.value, lsbMessage.value)
        i++ // Skip the next message.
      }
    }
    mergedMessages.push(message)
  }
  return mergedMessages
}

function parseChannelVoiceMessageStatus(
  byte: any
): { type: string; channel: Channel } {
  for (const [type, statusByte] of Object.entries(
    channelVoiceMessageStatusBytes
  )) {
    if (byte >= statusByte && byte <= statusByte + 0b1111) {
      const channel = u4(byte) + 1
      return { type, channel }
    }
  }
  throw new InternalError(
    'should not attempt to parse channel voice message unless we know the byte is a channel voice message status byte.'
  )
}

function isDataByte(byte: any): boolean {
  return byte >= 0x00 && byte <= 0x7f
}

function isChannelVoiceMessage(byte: any): boolean {
  return byte >= 0x80 && byte <= 0xef
}

function isSystemMessage(byte: any): boolean {
  return byte >= 0xf0 && byte <= 0xff
}

function parseBool(byte: number): boolean {
  assertU7(byte)
  return byte >= 64
}

function msbLsbToU14(msb: number, lsb: number): U14 {
  assertU7(msb)
  assertU7(lsb)
  return (msb << 7) + lsb
}

function assertU7(byte: any) {
  if (byte < 0 || byte > 0b0111_1111) {
    throw new OutOfRangeError(`expected a data byte (U7), got: ${byte}`)
  }
}

function assertByte(byte: any) {
  if (byte < 0 || byte > 0b1111_1111) {
    throw new OutOfRangeError(`expected a byte (0-FF), got: ${byte}`)
  }
}

class UnexpectedDataError extends Error {}
class OutOfRangeError extends Error {}
class InternalError extends Error {}

function invert(map: { [key: string]: number }): { [key: number]: string } {
  const inverted: { [key: number]: string } = {}
  for (let [key, value] of Object.entries(map)) {
    inverted[value] = key
  }
  return inverted
}
