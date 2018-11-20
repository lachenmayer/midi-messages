/// <reference types="node" />
import { Transform, TransformCallback } from 'readable-stream';
export declare class DecodeStream extends Transform {
    _mergedCCMessages: ControlChange[];
    constructor();
    write(chunk: BufferLike, cb?: NodeCallback | undefined): boolean;
    _transform(chunk: Buffer, _enc: string, cb: TransformCallback): void;
    _onmessage: (message: MIDIMessage) => void;
}
