import { Transform, TransformCallback } from 'readable-stream'
import { encode } from './encode'

type Options = {
  useRunningStatus: boolean
}

export class EncodeStream extends Transform {
  options: Options
  runningStatus: number | null = null

  constructor(options: Options = { useRunningStatus: true }) {
    super({ objectMode: true })
    this.options = options
  }

  write(message: MIDIMessage, cb?: NodeCallback | undefined): boolean {
    return super.write(message, cb)
  }

  _transform(message: any, _enc: string, next: TransformCallback) {
    const encoded = []
    try {
      for (const [status, ...data] of encode(message)) {
        if (this.options.useRunningStatus) {
          if (status != this.runningStatus) {
            encoded.push(status)
            this.runningStatus = status
          }
        } else {
          encoded.push(status)
        }
        encoded.push(...data)
      }
      const buf = Buffer.from(encoded)
      return next(undefined, buf)
    } catch (error) {
      return next(error)
    }
  }
}
