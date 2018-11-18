type MIDIMessage = MIDIChannelMessage | MIDISystemMessage

type MIDIChannelMessage = MIDIChannelVoiceMessage | MIDIChannelModeMessage

type MIDIChannelVoiceMessage =
  | NoteOff
  | NoteOn
  | PolyKeyPressure
  | ControlChange
  | ProgramChange
  | ChannelKeyPressure
  | PitchBendChange
  | ControlChange14
  | RPNChange
  | NRPNChange

type NoteOff = {
  type: 'NoteOff'
  channel: Channel
  note: number // U7
  velocity: number // U7
}

type NoteOn = {
  type: 'NoteOn'
  channel: Channel
  note: number // U7
  velocity: number // U7
}

type PolyKeyPressure = {
  type: 'PolyKeyPressure'
  channel: Channel
  note: number // U7
  pressure: number // U7
}

type ControlChange = {
  type: 'ControlChange'
  channel: Channel
  control: number // U7
  value: number // U7
}

type ControlChange14 = {
  type: 'ControlChange14'
  channel: Channel
  control: number // U5
  value: number // U14
}

type ProgramChange = {
  type: 'ProgramChange'
  channel: Channel
  number: number // U7
}

type ChannelKeyPressure = {
  type: 'ChannelKeyPressure'
  channel: Channel
  pressure: number // U7
}

type PitchBendChange = {
  type: 'PitchBendChange'
  channel: Channel
  value: number // U14
}

type RPNChange = {
  type: 'RPNChange'
  channel: Channel
  parameter: number // U14
  value: number // U14
}

type NRPNChange = {
  type: 'NRPNChange'
  channel: Channel
  parameter: number // U14
  value: number // U14
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

// 1-indexed
type Channel =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16

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
  deviceId: number
  data: number[]
}

// TODO implement proper parsing of MTC values
// See MIDI Time Code spec p1 (p116 of complete spec)
type MTCQuarterFrame = {
  type: 'MTCQuarterFrame'
  data: number
}

type SongPositionPointer = {
  type: 'SongPositionPointer'
  position: number // U14
}

type SongSelect = {
  type: 'SongSelect'
  number: number // U7
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
