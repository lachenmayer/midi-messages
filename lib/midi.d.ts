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
export declare function channelVoiceStatus(statusByte: number, channel: Channel): number;
export declare function lsb(msbControlNumber: number): number;
export declare function deviceId(id: SysExDeviceID): number[];
export declare function u4(n: number): U4;
export declare function u7(n: number): U7;
export declare function bool(b: boolean): U7;
export declare function u14ToMsbLsb(n: U14): {
    msb: U7;
    lsb: U7;
};
export declare function isDataByte(byte: any): boolean;
export declare function isChannelVoiceMessage(byte: any): boolean;
export declare function isSystemMessage(byte: any): boolean;
export declare function parseBool(byte: number): boolean;
export declare function msbLsbToU14(msb: number, lsb: number): U14;
export declare function assertU7(byte: any): void;
export declare function assertByte(byte: any): void;
