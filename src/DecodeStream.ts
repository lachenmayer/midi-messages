import { Transform, TransformCallback } from 'readable-stream'
import { decode } from './decode'
import { lsb, msbLsbToU14 } from './midi'

export class DecodeStream extends Transform {
  _mergedCCMessages: ControlChange[] = []

  constructor() {
    super({ readableObjectMode: true })
  }

  write(chunk: BufferLike, cb?: NodeCallback | undefined) {
    return super.write(Buffer.from(chunk), cb)
  }

  _transform(chunk: Buffer, _enc: string, cb: TransformCallback) {
    try {
      decode(chunk, this._onmessage)
      for (const message of this._mergedCCMessages) {
        this.push(message)
      }
      this._mergedCCMessages = []
      cb(undefined)
    } catch (error) {
      cb(error)
    }
  }

  _onmessage = (message: MIDIMessage) => {
    // If a CC message that could be interpreted as MSB/LSB is emitted,
    // wait for the next message - if it's the corresponding LSB message,
    // emit a merged message. If not, emits the CC message once the next message
    // is emitted.
    if (message.type === 'ControlChange' && message.control < 32) {
      // Only the first 32 CC messages are defined as MSB/LSB (coarse/fine) messages.
      this._mergedCCMessages.push(message)
    } else if (
      this._mergedCCMessages.length > 0 &&
      message.type === 'ControlChange' &&
      message.control ===
        lsb(this._mergedCCMessages[this._mergedCCMessages.length - 1].control)
    ) {
      const msbMessage = this._mergedCCMessages.pop()
      if (typeof msbMessage === 'undefined') {
        // this._mergedCCMessages.length > 0, so this can not happen.
        throw new Error('invariant error')
      }
      msbMessage.value = msbLsbToU14(msbMessage.value, message.value)
      this.push(msbMessage)
    } else {
      this.push(message)
    }
  }
}
