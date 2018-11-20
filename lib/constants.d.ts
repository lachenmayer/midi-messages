export declare const channelVoiceMessageStatusBytes: {
    [type in MIDIChannelVoiceMessage['type']]: number;
};
export declare const systemMessageStatusBytes: {
    [type in MIDISystemMessage['type']]: number;
};
export declare const systemMessageTypes: {
    [key: number]: string;
};
export declare const statusBytes: {
    SysEx: number;
    MTCQuarterFrame: number;
    SongPositionPointer: number;
    SongSelect: number;
    TuneRequest: number;
    TimingClock: number;
    Start: number;
    Continue: number;
    Stop: number;
    ActiveSensing: number;
    SystemReset: number;
    NoteOff: number;
    NoteOn: number;
    PolyKeyPressure: number;
    ControlChange: number;
    ProgramChange: number;
    ChannelKeyPressure: number;
    PitchBendChange: number;
};
export declare const controlNumbers: {
    dataEntryMsb: number;
    nrpnMsb: number;
    nrpnLsb: number;
    rpnMsb: number;
    rpnLsb: number;
    AllSoundOff: number;
    ResetAllControllers: number;
    LocalControl: number;
    AllNotesOff: number;
    OmniOff: number;
    OmniOn: number;
    MonoMode: number;
    PolyMode: number;
};
export declare const eox = 247;
