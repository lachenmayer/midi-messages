# @lachenmayer/midi-messages

A MIDI message encoder/decoder. Because all other ones I've found have weird APIs, weird dependencies, or were just generally weird. Which is weird, because MIDI is such a simple and mostly sensible format.

The module is implemented in TypeScript. The message types are designed to match the official MIDI spec as closely as possible, in naming and structure. See the [`types.ts`](src/types.ts) files for how messages are parsed.

## Non-scope & caveats

- **This module does not parse MIDI files.** I wrote this to interface with MIDI controllers in a live environment. This module exists because [node-midi](https://www.npmjs.com/package/midi) does not parse MIDI messages, and instead returns cryptic arrays of numbers -- which is not very useful when you actually want to do something with the MIDI messages.

- **This module currently does not parse Sample Dump messages.** While this would be a nice addition to this module, it is currently not implemented because I have no use for it.

- **This module currently does not parse the contents of timecode (MTC) messages.** This will probably be added at some point.

- **This module silently overflows.** All MIDI data bytes are 7-bit, ie. 0 to 127. You might expect this module to throw errors if values are out of range, but it doesn't. Values wrap around instead.

## Useful links

- [MIDI Spec 1.0](https://www.midi.org/specifications-old/item/the-midi-1-0-specification)
- [http://midi.teragonaudio.com/tech/midispec.htm](http://midi.teragonaudio.com/tech/midispec.htm)
- [MIDI Events DTD](https://www.midi.org/dtds/MIDIEvents10.dtd.html)