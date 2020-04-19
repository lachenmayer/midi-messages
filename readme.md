# @lachenmayer/midi-messages

A MIDI message encoder/decoder written in TypeScript. Because all other ones I've found have weird APIs, weird dependencies, or were just generally weird. Which is weird, because MIDI is such a simple and mostly sensible format.

This module exists because [node-midi](https://www.npmjs.com/package/midi) and [WebMIDI](https://www.w3.org/TR/webmidi/) do not parse MIDI messages, and instead return cryptic arrays of numbers. That's not very useful, especially if you actually want to do something with the MIDI messages.

This module parses raw MIDI messages into JavaScript objects. These objects are designed to match the official MIDI spec as closely as possible, in naming and structure. See the [type definitions](src/types.ts) for details on how the message objects are structured.

## Non-scope / caveats

- **This module does not parse or play MIDI files.** I wrote this to interface with MIDI controllers in real time, not to read MIDI files.

- **This module silently overflows.** All MIDI data bytes are 7-bit values, ie. 0 to 127. You might expect this module to throw errors if values are out of range, but it doesn't. Values wrap around instead.

- **This module currently does not parse Sample Dump messages.** While this would be a nice addition to this module, it is currently not implemented because I have no use for it.

- **This module currently does not parse the contents of timecode (MTC) messages.** The contents of MTC quarter frame messages are currently only represented as an opaque number. MTC sysex messages are not parsed at all, and are just emitted as unparsed sysex messages. Partial support for this will probably be added at some point (probably only for MTC quarter frame messages).

## Install

```
npm install @lachenmayer/midi-messages
```

<details>
<summary><em>(Why `@lachenmayer/midi-messages` and not just `midi-messages`?)</em></summary>
While I believe that this module could be useful to a lot of people, I wrote it for my own purposes, and I'm not interested in maintaining it for others. If you find a bug, feel free to open an issue or pull request, but don't expect me to spend time fixing it unless it affects me.

I believe that most people should author packages under their own scope, (a) to avoid name-squatting and namespace pollution, and (b) so that it is clear who is maintaining the module.

Feel free to publish your own fork on NPM, but please publish it under your own scope.
</details>

## Usage

### Simple encoding

```js
const { EncodeStream } = require('@lachenmayer/midi-messages')

const encode = new EncodeStream()

encode.on('data', buf => {
  console.log(buf)
})

encode.noteOn(1, 64, 100)
// ...equivalent to:
// encode.write({ type: 'NoteOn', channel: 1, note: 64, velocity: 100 })
```

**Output:**

```
<Buffer 90 40 64>
```

### Simple decoding

```js
const { DecodeStream } = require('@lachenmayer/midi-messages')

const decode = new DecodeStream()

decode.on('data', message => {
  console.log(message)
})

decode.write(Buffer.from('904064', 'hex'))
decode.write(Buffer.from('80407f', 'hex'))
```

**Output:**

```js
{ type: 'NoteOn', channel: 1, note: 64, velocity: 100 }
{ type: 'NoteOff', channel: 1, note: 64, velocity: 127 }
```

### Usage with [node-midi](https://npm.im/midi)

The following example creates a virtual MIDI output device and plays a random MIDI note every second.

```js
const { EncodeStream } = require('@lachenmayer/midi-messages')
const midi = require('midi')

const output = new midi.output()
output.openVirtualPort('random note every second')

const encode = new EncodeStream()
encode.pipe(midi.createWriteStream(output))

setInterval(() => {
  const note = Math.floor(Math.random() * 128)
  const velocity = Math.floor(Math.random() * 128)
  console.log('Playing note:', note, 'velocity:', velocity)
  encode.noteOn(1, note, velocity)
  setTimeout(() => {
  console.log('Stopping note:', note)
    encode.noteOff(1, note, velocity)
  }, 200)
}, 1000)
```

## API

This module exposes [Node streams](https://nodejs.org/docs/latest/api/stream.html) for encoding & decoding. **If you are unfamiliar with how Node streams work, check out [stream-handbook](https://github.com/substack/stream-handbook) for a hands-on introduction.**

### [`MIDIMessage`](src/types.ts)

A `MIDIMessage` object represents a single MIDI message. Every `MIDIMessage` object has a `type` field which corresponds to the message type (_status byte_) as defined in the MIDI specification. Most other messages contain data fields, eg. a lot of messages contain a  `channel` field.

The `MIDIMessage` types are defined in [`src/types.ts`](src/types.ts), check this file for the exact definitions. An example definition looks like this:

```typescript
type NoteOn = {
  type: 'NoteOn'
  channel: Channel
  note: U7
  velocity: U7
}
```

The `Channel` & `U7` types are really just `number`s. The type names are used as a documentation hint to remind you of the range of values that can be encoded in a message. **The ranges are not enforced at runtime - you are responsible for checking that the values you write are within range, otherwise they will silently overflow.** You should be aware of these types:

| Type | Range (inclusive) | Comment |
|------|-------------------|-------|
| `Channel` | `1`-`16` | **1-indexed**, ie. the first channel is `1`, not `0` |
| `U7` | `0`-`127` | 7-bit unsigned integer |
| `U14` | `0`-`16383` | 14-bit unsigned integer |

### [`EncodeStream`](src/EncodeStream.ts)

A [transform stream](https://nodejs.org/api/stream.html#stream_class_stream_transform) which turns [`MIDIMessage`](src/types.ts) objects into buffers containing binary MIDI data. Use this if you want to generate new MIDI messages in your application and send them "down the wire", eg. to a MIDI device.

#### `const encode = new EncodeStream(options?)`

Options & default values:

- `useRunningStatus: true` encode messages using [running status](http://midi.teragonaudio.com/tech/midispec/run.htm), ie. omit the status byte when the previous message has the same status byte.

#### `encode.write(message: MIDIMessage)`

Use this to manually encode a [`MIDIMessage`](src/types.ts) object. You can either call this directly, or use one of the convenience methods listed below to encode a message.

#### `encode.pipe(destination: WritableStream)`

Use this to automatically push data to a writable stream, for example a [`node-midi`](https://npm.im/midi) output stream, or a [file stream](https://nodejs.org/api/fs.html#fs_fs_createwritestream_path_options).

#### `encode.on('data', cb: (buf: Buffer) => any)`

The `data` event is emitted (synchronously) with the message encoded in a [Buffer](https://nodejs.org/api/buffer.html) every time a message has been written to the stream.

#### `encode.on('error', cb: (err: Error) => any)`

The `error` event is emitted when there is an error in your input.

The error can be one of the following:

- `err.name === 'TypeError'`: Thrown when the message you wrote using `encode.write` is not a valid [`MIDIMessage`](src/types.ts) object.

#### Convenience methods

`EncodeStream` instances expose the following methods, which are very simple wrappers around `encode.write`.

```typescript
encode.noteOff(channel: Channel, note: U7, velocity: U7)
encode.noteOn(channel: Channel, note: U7, velocity: U7)
encode.polyKeyPressure(channel: Channel, note: U7, pressure: U7)
encode.controlChange(channel: Channel, control: U7, value: U7 | U14)
encode.programChange(channel: Channel, number: U7)
encode.channelKeyPressure(channel: Channel, pressure: U7)
encode.pitchBendChange(channel: Channel, value: U14)
encode.rpnChange(channel: Channel, parameter: U14, value: U14)
encode.nrpnChange(channel: Channel, parameter: U14, value: U14)
encode.allSoundOff(channel: Channel)
encode.resetAllControllers(channel: Channel)
encode.localControl(channel: Channel, value: boolean)
encode.allNotesOff(channel: Channel)
encode.omniOff(channel: Channel)
encode.omniOn(channel: Channel)
encode.monoMode(channel: Channel)
encode.polyMode(channel: Channel)
encode.sysEx(deviceId: SysExDeviceID, data: U7[])
encode.mtcQuarterFrame(data: U7)
encode.songPositionPointer(position: U14)
encode.songSelect(number: U7)
encode.tuneRequest()
encode.timingClock()
encode.start()
encode.continue()
encode.stop()
encode.activeSensing()
encode.systemReset()
```

### [`DecodeStream`](src/DecodeStream.ts)

A [transform stream](https://nodejs.org/api/stream.html#stream_class_stream_transform) which parses binary MIDI data into `MIDIMessage` objects. Use this if you want to interpret MIDI data coming "from the wire", eg. from a MIDI device.

#### `const decode = new DecodeStream()`

This constructor has no options. Running status is handled automatically as needed.

#### `decode.write(buf: Buffer)`

Use this to manually decode a single [Buffer](https://nodejs.org/api/buffer.html) containing binary MIDI data.

#### `decode.pipe(destination: WritableStream)`

Use this to automatically push data to a writable stream.

Note that the readable side of `DecodeStream` operates in [object mode](https://nodejs.org/api/stream.html#stream_object_mode), so you will not be able to pipe this directly to a stream expecting binary data.

#### `decode.on('data', cb: (message: MIDIMessage) => any)`

The `data` event is emitted (synchronously) with a `MIDIMessage` object for every message found in the given buffer that was written to the stream.

#### `decode.on('error', cb: (err: Error) => any)`

The `error` event is emitted when there is an error in your input.

The error can be one of the following:

- `err.name === 'UnexpectedDataError'`: Thrown when the protocol expects a _status byte_ (`0x80`-`0xFF`), but a _data byte_ (`0x00`-`0x7F`) was found. Indicates that the contents of the buffer are not valid MIDI data (or that there is a bug in the decoding implementation!)
- `err.name === 'UnexpectedEOFError'`: Thrown when the protocol expects further data bytes, but end of the buffer has been reached. The input buffer must contain full MIDI messages.
- `err.name === 'InternalError'`: If you see one of these, please open an issue. Indicates an implementation error in the decoding logic.

## Further reading

- [MIDI Spec 1.0](https://www.midi.org/specifications-old/item/the-midi-1-0-specification)
- [http://midi.teragonaudio.com/tech/midispec.htm](http://midi.teragonaudio.com/tech/midispec.htm)
- [MIDI Events DTD](https://www.midi.org/dtds/MIDIEvents10.dtd.html)

## License

MIT © 2018 harry lachenmayer