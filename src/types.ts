type MIDIMessage = MIDIChannelMessage | MIDISystemMessage

type MIDIChannelMessage =
  | MIDIChannelVoiceMessage
  | MIDIChannelModeMessage
  | RPNChange
  | NRPNChange

type MIDIChannelVoiceMessage =
  | NoteOff
  | NoteOn
  | PolyKeyPressure
  | ControlChange
  | ProgramChange
  | ChannelKeyPressure
  | PitchBendChange

type NoteOff = {
  type: 'NoteOff'
  channel: Channel
  note: U7
  velocity: U7
}

type NoteOn = {
  type: 'NoteOn'
  channel: Channel
  note: U7
  velocity: U7
}

type PolyKeyPressure = {
  type: 'PolyKeyPressure'
  channel: Channel
  note: U7
  pressure: U7
}

type ControlChange = {
  type: 'ControlChange'
  channel: Channel
  control: U7
  value: U7 | U14
}

type ProgramChange = {
  type: 'ProgramChange'
  channel: Channel
  number: U7
}

type ChannelKeyPressure = {
  type: 'ChannelKeyPressure'
  channel: Channel
  pressure: U7
}

type PitchBendChange = {
  type: 'PitchBendChange'
  channel: Channel
  value: U14
}

type RPNChange = {
  type: 'RPNChange'
  channel: Channel
  parameter: U14
  value: U14
}

type NRPNChange = {
  type: 'NRPNChange'
  channel: Channel
  parameter: U14
  value: U14
}

type MIDIChannelModeMessage =
  | AllSoundOff
  | ResetAllControllers
  | LocalControl
  | AllNotesOff
  | OmniOff
  | OmniOn
  | MonoMode
  | PolyMode

type AllSoundOff = {
  type: 'AllSoundOff'
  channel: Channel
}

type ResetAllControllers = {
  type: 'ResetAllControllers'
  channel: Channel
}

type LocalControl = {
  type: 'LocalControl'
  channel: Channel
  value: boolean // false: off, true: on
}

type AllNotesOff = {
  type: 'AllNotesOff'
  channel: Channel
}

type OmniOff = {
  type: 'OmniOff'
  channel: Channel
}

type OmniOn = {
  type: 'OmniOn'
  channel: Channel
}

type MonoMode = {
  type: 'MonoMode'
  channel: Channel
}

type PolyMode = {
  type: 'PolyMode'
  channel: Channel
}

// 1-indexed, 1-16
type Channel = number

type MIDISystemMessage =
  | SysEx
  | MTCQuarterFrame
  | SongPositionPointer
  | SongSelect
  | TuneRequest
  | TimingClock
  | Start
  | Continue
  | Stop
  | ActiveSensing
  | SystemReset

type SysEx = {
  type: 'SysEx'
  deviceId: SysExDeviceID
  data: U7[]
}

// See MIDI 1.0 Detailed Specification 4.2 p34-35 (p66-67 in PDF)
type SysExDeviceID = U7 | [U7] | [U7, U7, U7]

// TODO implement proper parsing of MTC values
// See MIDI Time Code spec p1 (p116 of complete spec)
type MTCQuarterFrame = {
  type: 'MTCQuarterFrame'
  data: U7
}

type SongPositionPointer = {
  type: 'SongPositionPointer'
  position: U14
}

type SongSelect = {
  type: 'SongSelect'
  number: U7
}

type TuneRequest = {
  type: 'TuneRequest'
}

type TimingClock = {
  type: 'TimingClock'
}

type Start = {
  type: 'Start'
}

type Continue = {
  type: 'Continue'
}

type Stop = {
  type: 'Stop'
}

type ActiveSensing = {
  type: 'ActiveSensing'
}

type SystemReset = {
  type: 'SystemReset'
}

// One of:
//   [status, data, data]
//   [status, data]
//   [status]
//   [0xF0, ...data, 0xF7] (sysex message)
type EncodedMessage = number[]

type U4 = number
type U7 = number
type U14 = number

interface BufferLike {
  [byte: number]: number
  length: number
}
