declare type MIDIMessage = MIDIChannelMessage | MIDISystemMessage;
declare type MIDIChannelMessage = MIDIChannelVoiceMessage | MIDIChannelModeMessage | RPNChange | NRPNChange;
declare type MIDIChannelVoiceMessage = NoteOff | NoteOn | PolyKeyPressure | ControlChange | ProgramChange | ChannelKeyPressure | PitchBendChange;
declare type NoteOff = {
    type: 'NoteOff';
    channel: Channel;
    note: U7;
    velocity: U7;
};
declare type NoteOn = {
    type: 'NoteOn';
    channel: Channel;
    note: U7;
    velocity: U7;
};
declare type PolyKeyPressure = {
    type: 'PolyKeyPressure';
    channel: Channel;
    note: U7;
    pressure: U7;
};
declare type ControlChange = {
    type: 'ControlChange';
    channel: Channel;
    control: U7;
    value: U7 | U14;
};
declare type ProgramChange = {
    type: 'ProgramChange';
    channel: Channel;
    number: U7;
};
declare type ChannelKeyPressure = {
    type: 'ChannelKeyPressure';
    channel: Channel;
    pressure: U7;
};
declare type PitchBendChange = {
    type: 'PitchBendChange';
    channel: Channel;
    value: U14;
};
declare type RPNChange = {
    type: 'RPNChange';
    channel: Channel;
    parameter: U14;
    value: U14;
};
declare type NRPNChange = {
    type: 'NRPNChange';
    channel: Channel;
    parameter: U14;
    value: U14;
};
declare type MIDIChannelModeMessage = AllSoundOff | ResetAllControllers | LocalControl | AllNotesOff | OmniOff | OmniOn | MonoMode | PolyMode;
declare type AllSoundOff = {
    type: 'AllSoundOff';
    channel: Channel;
};
declare type ResetAllControllers = {
    type: 'ResetAllControllers';
    channel: Channel;
};
declare type LocalControl = {
    type: 'LocalControl';
    channel: Channel;
    value: boolean;
};
declare type AllNotesOff = {
    type: 'AllNotesOff';
    channel: Channel;
};
declare type OmniOff = {
    type: 'OmniOff';
    channel: Channel;
};
declare type OmniOn = {
    type: 'OmniOn';
    channel: Channel;
};
declare type MonoMode = {
    type: 'MonoMode';
    channel: Channel;
};
declare type PolyMode = {
    type: 'PolyMode';
    channel: Channel;
};
declare type Channel = number;
declare type MIDISystemMessage = SysEx | MTCQuarterFrame | SongPositionPointer | SongSelect | TuneRequest | TimingClock | Start | Continue | Stop | ActiveSensing | SystemReset;
declare type SysEx = {
    type: 'SysEx';
    deviceId: SysExDeviceID;
    data: U7[];
};
declare type SysExDeviceID = U7 | [U7] | [U7, U7, U7];
declare type MTCQuarterFrame = {
    type: 'MTCQuarterFrame';
    data: U7;
};
declare type SongPositionPointer = {
    type: 'SongPositionPointer';
    position: U14;
};
declare type SongSelect = {
    type: 'SongSelect';
    number: U7;
};
declare type TuneRequest = {
    type: 'TuneRequest';
};
declare type TimingClock = {
    type: 'TimingClock';
};
declare type Start = {
    type: 'Start';
};
declare type Continue = {
    type: 'Continue';
};
declare type Stop = {
    type: 'Stop';
};
declare type ActiveSensing = {
    type: 'ActiveSensing';
};
declare type SystemReset = {
    type: 'SystemReset';
};
declare type EncodedMessage = number[];
declare type U4 = number;
declare type U7 = number;
declare type U14 = number;
interface BufferLike {
    [byte: number]: number;
    length: number;
}
declare type NodeCallback = (error: Error | null | undefined) => void;
