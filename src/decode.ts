import {
  assertByte,
  assertU7,
  channelVoiceMessageStatusBytes,
  controlNumbers,
  eox,
  isChannelVoiceMessage,
  isDataByte,
  isSystemMessage,
  msbLsbToU14,
  parseBool,
  systemMessageTypes,
  u4,
} from './midi'

export function decode(
  buf: BufferLike,
  onmessage: (message: MIDIMessage) => any
) {
  let runningStatus: number | null = null
  let i = 0

  while (i < buf.length) {
    const statusByte = readStatusByte()
    if (isChannelVoiceMessage(statusByte)) {
      runningStatus = statusByte
      readChannelVoiceMessage(statusByte)
    } else if (isSystemMessage(statusByte)) {
      runningStatus = null
      readSystemMessage(statusByte)
    }
  }

  function readStatusByte() {
    let statusByte = peek()
    assertByte(statusByte)
    if (isDataByte(statusByte)) {
      if (runningStatus != null) {
        statusByte = runningStatus
      } else {
        throw new UnexpectedDataError(
          `did not expect data at index ${i}: ${statusByte}`
        )
      }
    } else {
      statusByte = next()
    }
    return statusByte
  }

  function readChannelVoiceMessage(statusByte: number) {
    const { type: type_, channel } = parseChannelVoiceMessageStatus(statusByte)
    // This constraint should be in parseChannelVoiceMessageStatus return type,
    // but Object.entries loses this constraint unfortunately.
    const type = type_ as MIDIChannelVoiceMessage['type']
    switch (type) {
      case 'NoteOff': {
        const note = readU7()
        const velocity = readU7()
        onmessage({ type, channel, note, velocity })
        break
      }
      case 'NoteOn': {
        const note = readU7()
        const velocity = readU7()
        onmessage({ type, channel, note, velocity })
        break
      }
      case 'PolyKeyPressure': {
        const note = readU7()
        const pressure = readU7()
        onmessage({ type, channel, note, pressure })
        break
      }
      case 'ControlChange': {
        const control = readU7()
        const value = readU7()
        if (control == controlNumbers.AllSoundOff) {
          onmessage({ type: 'AllSoundOff', channel })
        } else if (control == controlNumbers.ResetAllControllers) {
          onmessage({ type: 'ResetAllControllers', channel })
        } else if (control == controlNumbers.LocalControl) {
          onmessage({
            type: 'LocalControl',
            channel,
            value: parseBool(value),
          })
        } else if (control == controlNumbers.AllNotesOff) {
          onmessage({ type: 'AllNotesOff', channel })
        } else if (control == controlNumbers.OmniOff) {
          onmessage({ type: 'OmniOff', channel })
        } else if (control == controlNumbers.OmniOn) {
          onmessage({ type: 'OmniOn', channel })
        } else if (control == controlNumbers.MonoMode) {
          onmessage({ type: 'MonoMode', channel })
        } else if (control == controlNumbers.PolyMode) {
          onmessage({ type: 'PolyMode', channel })
        } else {
          onmessage({ type, channel, control, value })
        }
        break
      }
      case 'ProgramChange': {
        const number = readU7()
        onmessage({ type, channel, number })
        break
      }
      case 'ChannelKeyPressure': {
        const pressure = readU7()
        onmessage({ type, channel, pressure })
        break
      }
      case 'PitchBendChange': {
        const value = readU14()
        onmessage({ type, channel, value })
        break
      }
      default: {
        throw new InternalError(`case not implemented: ${type}`)
      }
    }
  }

  function readSystemMessage(statusByte: number) {
    const type = systemMessageTypes[statusByte] as MIDISystemMessage['type']
    switch (type) {
      case 'SysEx': {
        const deviceId = readU7()
        const data = readSysExData()
        onmessage({ type, deviceId, data })
        break
      }
      case 'MTCQuarterFrame': {
        const data = readU7()
        onmessage({ type, data })
        break
      }
      case 'SongPositionPointer': {
        const position = readU14()
        onmessage({ type, position })
        break
      }
      case 'SongSelect': {
        const number = readU7()
        onmessage({ type, number })
        break
      }
      case 'TuneRequest': {
        onmessage({ type })
        break
      }
      case 'TimingClock': {
        onmessage({ type })
        break
      }
      case 'Start': {
        onmessage({ type })
        break
      }
      case 'Continue': {
        onmessage({ type })
        break
      }
      case 'Stop': {
        onmessage({ type })
        break
      }
      case 'ActiveSensing': {
        onmessage({ type })
        break
      }
      case 'SystemReset': {
        onmessage({ type })
        break
      }
      default: {
        throw new InternalError(`case not implemented: ${type}`)
      }
    }
  }

  function readSysExData() {
    const data = []
    for (let byte = next(); byte != eox; byte = next()) {
      assertU7(byte)
      data.push(byte)
    }
    return data
  }

  function readU14(): U14 {
    const lsb = next()
    const msb = next()
    return msbLsbToU14(msb, lsb)
  }

  function readU7(): U7 {
    const byte = next()
    assertU7(byte)
    return byte
  }

  function peek() {
    return buf[i]
  }

  function next() {
    const next = buf[i]
    if (typeof next === 'undefined') {
      throw new UnexpectedEOFError()
    }
    i++
    return next
  }
}

function parseChannelVoiceMessageStatus(
  byte: any
): { type: string; channel: Channel } {
  for (const [type, statusByte] of Object.entries(
    channelVoiceMessageStatusBytes
  )) {
    if (byte >= statusByte && byte <= statusByte + 0b1111) {
      const channel = u4(byte) + 1
      return { type, channel }
    }
  }
  throw new InternalError(
    'should not attempt to parse channel voice message unless we know the byte is a channel voice message status byte.'
  )
}

class UnexpectedDataError extends Error {
  name = 'UnexpectedDataError'
}
class UnexpectedEOFError extends Error {
  name = 'UnexpectedEOFError'
}
class InternalError extends Error {
  name = 'InternalError'
}
