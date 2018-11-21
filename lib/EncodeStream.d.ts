/// <reference types="node" />
import { Transform, TransformCallback } from 'readable-stream';
declare type Options = {
    useRunningStatus: boolean;
};
export declare class EncodeStream extends Transform {
    options: Options;
    _runningStatus: number | null;
    constructor(options?: Options);
    write(message: MIDIMessage, cb?: NodeCallback | undefined): boolean;
    _transform(message: any, _enc: string, next: TransformCallback): void;
    noteOff(channel: Channel, note: U7, velocity: U7): void;
    noteOn(channel: Channel, note: U7, velocity: U7): void;
    polyKeyPressure(channel: Channel, note: U7, pressure: U7): void;
    controlChange(channel: Channel, control: U7, value: U7 | U14): void;
    programChange(channel: Channel, number: U7): void;
    channelKeyPressure(channel: Channel, pressure: U7): void;
    pitchBendChange(channel: Channel, value: U14): void;
    rpnChange(channel: Channel, parameter: U14, value: U14): void;
    nrpnChange(channel: Channel, parameter: U14, value: U14): void;
    allSoundOff(channel: Channel): void;
    resetAllControllers(channel: Channel): void;
    localControl(channel: Channel, value: boolean): void;
    allNotesOff(channel: Channel): void;
    omniOff(channel: Channel): void;
    omniOn(channel: Channel): void;
    monoMode(channel: Channel): void;
    polyMode(channel: Channel): void;
    sysEx(deviceId: SysExDeviceID, data: U7[]): void;
    mtcQuarterFrame(data: U7): void;
    songPositionPointer(position: U14): void;
    songSelect(number: U7): void;
    tuneRequest(): void;
    timingClock(): void;
    start(): void;
    continue(): void;
    stop(): void;
    activeSensing(): void;
    systemReset(): void;
}
export {};
