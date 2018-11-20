/// <reference types="node" />
import { Transform, TransformCallback } from 'readable-stream';
declare type Options = {
    useRunningStatus: boolean;
};
export declare class EncodeStream extends Transform {
    options: Options;
    runningStatus: number | null;
    constructor(options?: Options);
    write(message: MIDIMessage, cb?: NodeCallback | undefined): boolean;
    _transform(message: any, _enc: string, next: TransformCallback): void;
}
export {};
