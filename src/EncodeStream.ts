import { Transform, TransformCallback } from 'readable-stream'
import { encode } from './encode'

type Options = {
  useRunningStatus: boolean
}

export class EncodeStream extends Transform {
  options: Options
  _runningStatus: number | null = null

  constructor(options: Options = { useRunningStatus: true }) {
    super({ writableObjectMode: true })
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
          if (status != this._runningStatus) {
            encoded.push(status)
            this._runningStatus = status
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

  //
  // Channel messages
  //

  // Channel voice messages

  noteOff(channel: Channel, note: U7, velocity: U7) {
    this.write({ type: 'NoteOff', channel, note, velocity })
  }

  noteOn(channel: Channel, note: U7, velocity: U7) {
    this.write({ type: 'NoteOn', channel, note, velocity })
  }

  polyKeyPressure(channel: Channel, note: U7, pressure: U7) {
    this.write({ type: 'PolyKeyPressure', channel, note, pressure })
  }

  controlChange(channel: Channel, control: U7, value: U7 | U14) {
    this.write({ type: 'ControlChange', channel, control, value })
  }

  programChange(channel: Channel, number: U7) {
    this.write({ type: 'ProgramChange', channel, number })
  }

  channelKeyPressure(channel: Channel, pressure: U7) {
    this.write({ type: 'ChannelKeyPressure', channel, pressure })
  }

  pitchBendChange(channel: Channel, value: U14) {
    this.write({ type: 'PitchBendChange', channel, value })
  }

  rpnChange(channel: Channel, parameter: U14, value: U14) {
    this.write({ type: 'RPNChange', channel, parameter, value })
  }

  nrpnChange(channel: Channel, parameter: U14, value: U14) {
    this.write({ type: 'NRPNChange', channel, parameter, value })
  }

  // Channel mode messages

  allSoundOff(channel: Channel) {
    this.write({ type: 'AllSoundOff', channel })
  }

  resetAllControllers(channel: Channel) {
    this.write({ type: 'ResetAllControllers', channel })
  }

  localControl(channel: Channel, value: boolean) {
    this.write({ type: 'LocalControl', channel, value })
  }

  allNotesOff(channel: Channel) {
    this.write({ type: 'AllNotesOff', channel })
  }

  omniOff(channel: Channel) {
    this.write({ type: 'OmniOff', channel })
  }

  omniOn(channel: Channel) {
    this.write({ type: 'OmniOn', channel })
  }

  monoMode(channel: Channel) {
    this.write({ type: 'MonoMode', channel })
  }

  polyMode(channel: Channel) {
    this.write({ type: 'PolyMode', channel })
  }

  sysEx(deviceId: SysExDeviceID, data: U7[]) {
    this.write({ type: 'SysEx', deviceId, data })
  }

  mtcQuarterFrame(data: U7) {
    this.write({ type: 'MTCQuarterFrame', data })
  }

  songPositionPointer(position: U14) {
    this.write({ type: 'SongPositionPointer', position })
  }

  songSelect(number: U7) {
    this.write({ type: 'SongSelect', number })
  }

  tuneRequest() {
    this.write({ type: 'TuneRequest' })
  }

  timingClock() {
    this.write({ type: 'TimingClock' })
  }

  start() {
    this.write({ type: 'Start' })
  }

  continue() {
    this.write({ type: 'Continue' })
  }

  stop() {
    this.write({ type: 'Stop' })
  }

  activeSensing() {
    this.write({ type: 'ActiveSensing' })
  }

  systemReset() {
    this.write({ type: 'SystemReset' })
  }
}
