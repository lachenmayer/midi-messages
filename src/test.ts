import test = require('tape')
import { encode, decode } from './'

// Stolen from https://github.com/samdoshi/midi-rs/blob/master/src/to_raw_messages.rs#L131
test('encode', t => {
  //
  // Channel messages
  //

  // Channel voice messages

  t.deepEquals(
    encode({ type: 'NoteOff', channel: 1, note: 0, velocity: 0 }),
    [[128, 0, 0]],
    'NoteOff'
  )
  t.deepEquals(
    encode({ type: 'NoteOff', channel: 2, note: 127, velocity: 127 }),
    [[129, 127, 127]],
    'NoteOff'
  )
  t.deepEquals(
    encode({ type: 'NoteOff', channel: 3, note: 128, velocity: 128 }),
    [[130, 0, 0]],
    'NoteOff (overflow)'
  )
  t.deepEquals(
    encode({ type: 'NoteOff', channel: 17, note: 128, velocity: 128 }),
    [[128, 0, 0]],
    'NoteOff (channel overflow)'
  )

  t.deepEquals(
    encode({ type: 'NoteOn', channel: 4, note: 0, velocity: 0 }),
    [[147, 0, 0]],
    'NoteOn'
  )
  t.deepEquals(
    encode({ type: 'NoteOn', channel: 5, note: 127, velocity: 127 }),
    [[148, 127, 127]],
    'NoteOn'
  )
  t.deepEquals(
    encode({ type: 'NoteOn', channel: 6, note: 128, velocity: 128 }),
    [[149, 0, 0]],
    'NoteOn (overflow)'
  )

  t.deepEquals(
    encode({ type: 'PolyKeyPressure', channel: 11, note: 0, pressure: 0 }),
    [[170, 0, 0]],
    'PolyKeyPressure'
  )
  t.deepEquals(
    encode({ type: 'PolyKeyPressure', channel: 12, note: 127, pressure: 127 }),
    [[171, 127, 127]],
    'PolyKeyPressure'
  )
  t.deepEquals(
    encode({ type: 'PolyKeyPressure', channel: 13, note: 128, pressure: 128 }),
    [[172, 0, 0]],
    'PolyKeyPressure (overflow)'
  )

  t.deepEquals(
    encode({ type: 'ControlChange', channel: 1, control: 0, value: 0 }),
    [[176, 0, 0]],
    'ControlChange'
  )
  t.deepEquals(
    encode({ type: 'ControlChange', channel: 1, control: 0, value: 127 }),
    [[176, 0, 127]],
    'ControlChange'
  )
  t.deepEquals(
    encode({ type: 'ControlChange', channel: 1, control: 0, value: 128 }),
    [[176, 0, 1], [176, 32, 0]],
    'ControlChange (fine)'
  )
  t.deepEquals(
    encode({ type: 'ControlChange', channel: 1, control: 0, value: 128 * 128 }),
    [[176, 0, 0], [176, 32, 0]],
    'ControlChange (fine overflow)'
  )
  t.deepEquals(
    encode({ type: 'ControlChange', channel: 1, control: 127, value: 0 }),
    [[176, 127, 0]],
    'ControlChange'
  )
  t.deepEquals(
    encode({ type: 'ControlChange', channel: 1, control: 128, value: 0 }),
    [[176, 0, 0]],
    'ControlChange (control overflow)'
  )

  t.deepEquals(
    encode({ type: 'ProgramChange', channel: 1, number: 0 }),
    [[192, 0]],
    'ProgramChange'
  )
  t.deepEquals(
    encode({ type: 'ProgramChange', channel: 1, number: 127 }),
    [[192, 127]],
    'ProgramChange'
  )
  t.deepEquals(
    encode({ type: 'ProgramChange', channel: 1, number: 128 }),
    [[192, 0]],
    'ProgramChange (overflow)'
  )

  t.deepEquals(
    encode({ type: 'ChannelKeyPressure', channel: 14, pressure: 0 }),
    [[221, 0]],
    'ChannelKeyPressure'
  )
  t.deepEquals(
    encode({ type: 'ChannelKeyPressure', channel: 15, pressure: 127 }),
    [[222, 127]],
    'ChannelKeyPressure'
  )
  t.deepEquals(
    encode({ type: 'ChannelKeyPressure', channel: 16, pressure: 128 }),
    [[223, 0]],
    'ChannelKeyPressure (overflow)'
  )

  t.deepEquals(
    encode({ type: 'PitchBendChange', channel: 7, value: 0 }),
    [[230, 0, 0]],
    'PitchBendChange'
  )
  t.deepEquals(
    encode({ type: 'PitchBendChange', channel: 8, value: 1000 }),
    [[231, 104, 7]],
    'PitchBendChange'
  )
  t.deepEquals(
    encode({ type: 'PitchBendChange', channel: 9, value: 45000 }),
    [[232, 72, 95]],
    'PitchBendChange (overflow)'
  )
  t.deepEquals(
    encode({ type: 'PitchBendChange', channel: 9, value: 12232 }),
    [[232, 72, 95]],
    'PitchBendChange'
  )

  t.deepEquals(
    encode({ type: 'RPNChange', channel: 1, parameter: 1000, value: 0 }),
    [[176, 100, 7], [176, 101, 104], [176, 6, 0], [176, 38, 0]],
    'RPNChange'
  )
  t.deepEquals(
    encode({ type: 'RPNChange', channel: 1, parameter: 1000, value: 1000 }),
    [[176, 100, 7], [176, 101, 104], [176, 6, 7], [176, 38, 104]],
    'RPNChange'
  )

  t.deepEquals(
    encode({ type: 'NRPNChange', channel: 1, parameter: 1000, value: 0 }),
    [[176, 98, 7], [176, 99, 104], [176, 6, 0], [176, 38, 0]],
    'NRPNChange'
  )
  t.deepEquals(
    encode({ type: 'NRPNChange', channel: 1, parameter: 1000, value: 1000 }),
    [[176, 98, 7], [176, 99, 104], [176, 6, 7], [176, 38, 104]],
    'NRPNChange'
  )

  // Channel mode messages

  t.deepEquals(
    encode({ type: 'AllSoundOff', channel: 1 }),
    [[176, 120, 0]],
    'AllSoundOff'
  )

  t.deepEquals(
    encode({ type: 'ResetAllControllers', channel: 1 }),
    [[176, 121, 0]],
    'ResetAllControllers'
  )

  t.deepEquals(
    encode({ type: 'LocalControl', channel: 1, value: false }),
    [[176, 122, 0]],
    'LocalControl [off]'
  )
  t.deepEquals(
    encode({ type: 'LocalControl', channel: 1, value: true }),
    [[176, 122, 127]],
    'LocalControl [on]'
  )

  t.deepEquals(
    encode({ type: 'AllNotesOff', channel: 1 }),
    [[176, 123, 0]],
    'AllNotesOff'
  )

  //
  // System messages
  //

  t.deepEquals(
    encode({ type: 'SysEx', deviceId: 100, data: [1, 2, 3, 4] }),
    [[0b11110000, 100, 1, 2, 3, 4, 0b11110111]],
    'SysEx'
  )
  t.deepEquals(
    encode({ type: 'SysEx', deviceId: 100, data: [1, 2, 3, 4] }),
    [[0b11110000, 100, 1, 2, 3, 4, 0b11110111]],
    'SysEx'
  )
  t.deepEquals(
    encode({ type: 'SysEx', deviceId: [100], data: [1, 2, 3, 4] }),
    [[0b11110000, 100, 1, 2, 3, 4, 0b11110111]],
    'SysEx'
  )
  t.deepEquals(
    encode({ type: 'SysEx', deviceId: 128, data: [1, 2, 3, 4] }),
    [[0b11110000, 0, 1, 2, 3, 4, 0b11110111]],
    'SysEx (manufacturer id overflow)'
  )
  t.deepEquals(
    encode({ type: 'SysEx', deviceId: [100, 101, 102], data: [1, 2, 3, 4] }),
    [[0b11110000, 100, 101, 102, 1, 2, 3, 4, 0b11110111]],
    'SysEx (3-byte id)'
  )

  t.deepEquals(encode({ type: 'Start' }), [[0b11111010]], 'Start')

  t.deepEquals(encode({ type: 'TimingClock' }), [[0b11111000]], 'TimingClock')

  t.deepEquals(encode({ type: 'Continue' }), [[0b11111011]], 'Continue')

  t.deepEquals(encode({ type: 'Stop' }), [[0b11111100]], 'Stop')

  t.deepEquals(
    encode({ type: 'ActiveSensing' }),
    [[0b11111110]],
    'ActiveSensing'
  )

  t.deepEquals(encode({ type: 'SystemReset' }), [[0b11111111]], 'SystemReset')

  t.end()
})

test.only('decode', t => {
  //
  // Channel messages
  //

  // Channel voice messages

  t.deepEquals(
    decode([128, 0, 0]),
    [{ type: 'NoteOff', channel: 1, note: 0, velocity: 0 }],
    'NoteOff'
  )
  t.deepEquals(
    decode([129, 127, 127]),
    [{ type: 'NoteOff', channel: 2, note: 127, velocity: 127 }],
    'NoteOff'
  )

  t.deepEquals(
    decode([147, 0, 0]),
    [{ type: 'NoteOn', channel: 4, note: 0, velocity: 0 }],
    'NoteOn'
  )
  t.deepEquals(
    decode([148, 127, 127]),
    [{ type: 'NoteOn', channel: 5, note: 127, velocity: 127 }],
    'NoteOn'
  )

  t.deepEquals(
    decode([170, 0, 0]),
    [{ type: 'PolyKeyPressure', channel: 11, note: 0, pressure: 0 }],
    'PolyKeyPressure'
  )
  t.deepEquals(
    decode([171, 127, 127]),
    [{ type: 'PolyKeyPressure', channel: 12, note: 127, pressure: 127 }],
    'PolyKeyPressure'
  )

  t.deepEquals(
    decode([176, 0, 0]),
    [{ type: 'ControlChange', channel: 1, control: 0, value: 0 }],
    'ControlChange'
  )
  t.deepEquals(
    decode([176, 0, 127]),
    [{ type: 'ControlChange', channel: 1, control: 0, value: 127 }],
    'ControlChange'
  )
  t.deepEquals(
    decode([176, 0, 1, 176, 32, 0]),
    [{ type: 'ControlChange', channel: 1, control: 0, value: 128 }],
    'ControlChange (fine)'
  )
  t.deepEquals(
    decode([176, 0, 1, 176, 32, 0]),
    [{ type: 'ControlChange', channel: 1, control: 0, value: 128 }],
    'ControlChange 14-bit'
  )
  t.deepEquals(
    decode([176, 0, 1, 32, 0]),
    [{ type: 'ControlChange', channel: 1, control: 0, value: 128 }],
    'ControlChange 14-bit (running status)'
  )
  t.deepEquals(
    decode([176, 0, 1, 32, 0, 1, 1, 33, 0]),
    [
      { type: 'ControlChange', channel: 1, control: 0, value: 128 },
      { type: 'ControlChange', channel: 1, control: 1, value: 128 },
    ],
    'ControlChange two 14-bit messages (running status)'
  )

  t.deepEquals(
    decode([192, 0]),
    [{ type: 'ProgramChange', channel: 1, number: 0 }],
    'ProgramChange'
  )
  t.deepEquals(
    decode([192, 127]),
    [{ type: 'ProgramChange', channel: 1, number: 127 }],
    'ProgramChange'
  )

  t.deepEquals(
    decode([221, 0]),
    [{ type: 'ChannelKeyPressure', channel: 14, pressure: 0 }],
    'ChannelKeyPressure'
  )
  t.deepEquals(
    decode([222, 127]),
    [{ type: 'ChannelKeyPressure', channel: 15, pressure: 127 }],
    'ChannelKeyPressure'
  )

  t.deepEquals(
    decode([230, 0, 0]),
    [{ type: 'PitchBendChange', channel: 7, value: 0 }],
    'PitchBendChange'
  )
  t.deepEquals(
    decode([231, 104, 7]),
    [{ type: 'PitchBendChange', channel: 8, value: 1000 }],
    'PitchBendChange'
  )
  t.deepEquals(
    decode([232, 72, 95]),
    [{ type: 'PitchBendChange', channel: 9, value: 12232 }],
    'PitchBendChange'
  )

  // TODO implement RPN/NRPN parsing

  // t.deepEquals(
  //   decode([176, 100, 7, 176, 101, 104, 176, 6, 0, 176, 38, 0]),
  //   [{ type: 'RPNChange', channel: 1, parameter: 1000, value: 0 }],
  //   'RPNChange'
  // )
  // t.deepEquals(
  //   decode([176, 100, 7, 176, 101, 104, 176, 6, 7, 176, 38, 104]),
  //   [{ type: 'RPNChange', channel: 1, parameter: 1000, value: 1000 }],
  //   'RPNChange'
  // )

  // t.deepEquals(
  //   decode([176, 98, 7, 176, 99, 104, 176, 6, 0, 176, 38, 0]),
  //   [{ type: 'NRPNChange', channel: 1, parameter: 1000, value: 0 }],
  //   'NRPNChange'
  // )
  // t.deepEquals(
  //   decode([176, 98, 7, 176, 99, 104, 176, 6, 7, 176, 38, 104]),
  //   [{ type: 'NRPNChange', channel: 1, parameter: 1000, value: 1000 }],
  //   'NRPNChange'
  // )

  // Channel mode messages

  t.deepEquals(
    decode([176, 120, 0]),
    [{ type: 'AllSoundOff', channel: 1 }],
    'AllSoundOff'
  )

  t.deepEquals(
    decode([176, 121, 0]),
    [{ type: 'ResetAllControllers', channel: 1 }],
    'ResetAllControllers'
  )

  t.deepEquals(
    decode([176, 122, 0]),
    [{ type: 'LocalControl', channel: 1, value: false }],
    'LocalControl [off]'
  )
  t.deepEquals(
    decode([176, 122, 127]),
    [{ type: 'LocalControl', channel: 1, value: true }],
    'LocalControl [on]'
  )

  t.deepEquals(
    decode([176, 123, 0]),
    [{ type: 'AllNotesOff', channel: 1 }],
    'AllNotesOff'
  )

  t.deepEquals(
    decode([0b11110000, 100, 1, 2, 3, 4, 0b11110111]),
    [{ type: 'SysEx', deviceId: 100, data: [1, 2, 3, 4] }],
    'SysEx'
  )
  t.deepEquals(
    decode([0b11110000, 100, 101, 102, 1, 2, 3, 4, 0b11110111]),
    [{ type: 'SysEx', deviceId: 100, data: [101, 102, 1, 2, 3, 4] }],
    'SysEx (3-byte id)'
  )

  t.deepEquals(decode([0b11111010]), [{ type: 'Start' }], 'Start')

  t.deepEquals(decode([0b11111000]), [{ type: 'TimingClock' }], 'TimingClock')

  t.deepEquals(decode([0b11111011]), [{ type: 'Continue' }], 'Continue')

  t.deepEquals(decode([0b11111100]), [{ type: 'Stop' }], 'Stop')

  t.deepEquals(
    decode([0b11111110]),
    [{ type: 'ActiveSensing' }],
    'ActiveSensing'
  )

  t.deepEquals(decode([0b11111111]), [{ type: 'SystemReset' }], 'SystemReset')

  t.end()
})
