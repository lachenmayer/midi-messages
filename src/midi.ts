// Status bytes are the only bytes that have the most significant bit set.
// MIDI Spec 1.0 Page 100, Table 1
// https://www.midi.org/specifications/item/table-1-summary-of-midi-message

// Channel voice messages
// The second nibble is used to encode the channel (0-F).
export const channelVoiceMessageStatusBytes: {
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

export const systemMessageStatusBytes: {
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
export const systemMessageTypes = invert(systemMessageStatusBytes)

export const statusBytes = {
  ...channelVoiceMessageStatusBytes,
  ...systemMessageStatusBytes,
}

// Control numbers for control change messages.
// This is not a complete list, see MIDI Spec 1.0 Page 102, Table 3
export const controlNumbers = {
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
export const eox = 0xf7

// Encodes a channel into the lower nibble of a channel voice message status byte.
// Status byte must have all 4 low bits unset.
export function channelVoiceStatus(
  statusByte: number,
  channel: Channel
): number {
  return statusByte + u4(channel - 1)
}

// Returns the CC control number that sets the LSB (fine) value of the given control number.
export function lsb(msbControlNumber: number) {
  return 0x20 + msbControlNumber
}

export function deviceId(id: SysExDeviceID) {
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

export function u4(n: number): U4 {
  return n & 0b0000_1111
}

export function u7(n: number): U7 {
  return n & 0b0111_1111
}

export function bool(b: boolean): U7 {
  return b ? 0b0111_1111 : 0
}

export function u14ToMsbLsb(n: U14): { msb: U7; lsb: U7 } {
  return {
    msb: u7(n >> 7),
    lsb: u7(n),
  }
}

export function isDataByte(byte: any): boolean {
  return byte >= 0x00 && byte <= 0x7f
}

export function isChannelVoiceMessage(byte: any): boolean {
  return byte >= 0x80 && byte <= 0xef
}

export function isSystemMessage(byte: any): boolean {
  return byte >= 0xf0 && byte <= 0xff
}

export function parseBool(byte: number): boolean {
  assertU7(byte)
  return byte >= 64
}

export function msbLsbToU14(msb: number, lsb: number): U14 {
  assertU7(msb)
  assertU7(lsb)
  return (msb << 7) + lsb
}

export function assertU7(byte: any) {
  if (byte < 0 || byte > 0b0111_1111) {
    throw new OutOfRangeError(`expected a data byte (U7), got: ${byte}`)
  }
}

export function assertByte(byte: any) {
  if (byte < 0 || byte > 0b1111_1111) {
    throw new OutOfRangeError(`expected a byte (0-FF), got: ${byte}`)
  }
}

class OutOfRangeError extends Error {}

function invert(map: { [key: string]: number }): { [key: number]: string } {
  const inverted: { [key: number]: string } = {}
  for (let [key, value] of Object.entries(map)) {
    inverted[value] = key
  }
  return inverted
}
