# Neon Keys JS

An ’80s-inspired polyphonic synthesizer written in plain JavaScript and the Web Audio API. Includes an offline-friendly, responsive keyboard demo. Version 1.0.0.

## Play

1. Extract the ZIP, keeping all files together.
2. Open `index.html` in a modern browser.
3. Click **Enable audio**, select a preset, and play the on-screen keyboard or your computer keyboard.

No installation, server, samples, external fonts, dependencies, or build step is required. If your browser restricts local files, run `python3 -m http.server 8000` from this directory and open `http://localhost:8000`.

## Features

- 10 original presets: Midnight pad, Neon brass, After-hours EP, Crystal glass, Night drive, Laser lead, VHS strings, Arcade pluck, Chrome organ, Dream sequence.
- Analog-style subtractive synthesis: two detuned oscillators, optional sub oscillator, resonant low-pass filtering, amplitude and filter envelopes.
- Two-operator FM synthesis for electric piano, glass bells, and organ textures.
- Stereo chorus, four-stage phaser, damped ping-pong delay, and convolution reverb generated from a deterministic noise impulse.
- 24-note polyphony by default, with oldest released voice preferred for stealing.
- Sustain, ±2-semitone pitch bend, modulation-wheel vibrato, velocity, and octave shift.
- A sixteenth-note arpeggiator with up, down, up/down, random, and one/two-octave modes.
- An original demo progression, live waveform display, and voice count.
- Mouse, multi-touch, computer keyboard, and focused-key Enter input.

These are original patches inspired by broad 1980s sounds, not circuit-accurate emulations or sampled recreations of specific instruments. The synth is polyphonic; bass and lead patches are also polyphonic.

## Controls

| Input                             | Action                                                          |
| --------------------------------- | --------------------------------------------------------------- |
| A W S E D F T G Y H U J K O L P ; | C4–E5 chromatically                                             |
| Z / X                             | Shift computer-keyboard octave down / up                        |
| Space                             | Hold sustain                                                    |
| Sustain button                    | Latch sustain                                                   |
| Escape / All notes off            | Stop demo, clear held notes and sustain, quickly release voices |
| Pitch                             | Bend ±2 semitones; returns to center when released              |
| Mod                               | Add vibrato                                                     |

The on-screen keyboard spans C3–C6 and scrolls horizontally on narrow screens. Octave shift affects computer-keyboard input only. Input shortcuts do not intercept sliders or select menus. Key rollover limitations depend on your keyboard hardware. Losing focus or hiding the page releases notes and stops the demo.

Enable the arpeggiator, then hold notes. Sustain applies to directly played notes; arpeggiator and demo notes use explicit gate durations. Switching arp mode clears held notes. Demo playback uses the current preset; bass uses a lower, sparse line. Effects may ring briefly after stopping notes.

Envelope, filter, and oscillator edits apply to **new** notes. Effects, volume, pitch bend, and modulation update live. Detune and filter-envelope controls are disabled for FM presets because those patches do not use them. Effect amounts are send levels; the dry signal stays present.

## Use the synth in your project

Include the standalone engine; the demo files are optional:

```html
<script src="neon-keys.js"></script>
<button id="play">Play</button>
<script>
  const synth = new NeonKeys({ preset: "epiano", volume: 0.55 });
  document.querySelector("#play").onclick = async () => {
    await synth.resume(); // Browser audio unlock requires a user gesture.
    const voice = synth.noteOn(60, 0.8);
    setTimeout(() => synth.noteOff(voice), 700);
  };
</script>
```

A `noteOn` call returns a unique voice ID. Release by ID when multiple inputs may play the same pitch. `noteOff(60)` releases every directly held C4 voice. MIDI numbers are accepted; hardware MIDI input is not included in the demo.

```js
const synth = new NeonKeys({
  context: existingAudioContext, // optional; otherwise creates its own
  destination: existingAudioContext.destination, // optional
  maxVoices: 24, // 1–64
  volume: 0.55, // 0–1
  preset: "midnight",
});

await synth.resume();
synth.setPreset("brass");
synth.setParam("cutoff", 2800);
synth.setParam("delayTime", 0.375); // seconds
synth.setParam("feedback", 0.35);
synth.setSustain(true);
synth.setSustain(false);
synth.setPitchBend(0.5); // -1..1 maps to -2..2 semitones
synth.setModulation(0.25); // 0..1
synth.setVolume(0.4);
const params = synth.getParams(); // independent copy
const presets = NeonKeys.presets;

// Audio-clock scheduling (absolute AudioContext time).
const when = synth.context.currentTime + 0.05;
synth.playNote(64, 0.4, 0.75, { when });
// playNote duration is the gate time, excluding release/effect tails.
// Sequenced notes ignore sustain and release at their scheduled time.

synth.allNotesOff(); // normal release
synth.allNotesOff({ immediate: true }); // quick fade; effects retain tails
await synth.dispose(); // disconnect; closes only owned context
```

Call `noteOn(note, velocity, { when })` and `noteOff(voiceIdOrNote, { when })` for low-level scheduling. Omitting `when` starts immediately; past times clamp to the current audio clock. Schedule shortly ahead (the demo uses a 90 ms window); scheduled voices reserve polyphony slots. `playNote` already schedules its release, so use the immediate all-notes-off option to cancel it early.

`NeonKeys` is exposed as a browser global, and exported with `module.exports` when present. The engine still requires a Web Audio context and does not produce audio in plain Node.js without a compatible implementation.

## Parameters

`setParam(name, value)` accepts finite numbers, clamps them to the ranges below, and returns the effective value. Unknown parameters/presets and nonfinite numbers throw errors. MIDI notes are rounded and must lie in 0–127. Velocity is clamped to 0–1; zero does not create a voice.

| Parameter       | Range       | Meaning                         |
| --------------- | ----------- | ------------------------------- |
| attack          | 0.002–3 s   | Amplitude/filter attack         |
| decay           | 0.03–8 s    | Envelope decay                  |
| sustain         | 0–1         | Held amplitude level            |
| release         | 0.03–5 s    | Key-release fade                |
| cutoff          | 80–16000 Hz | Base low-pass cutoff            |
| resonance       | 0.1–10      | Filter Q                        |
| envAmount       | 0–12000 Hz  | Velocity-sensitive filter sweep |
| detune          | 0–30 cents  | Total analog oscillator spread  |
| sub             | 0–1         | Analog sine sub level           |
| chorus / phaser | 0–1         | Effect send amount              |
| delay           | 0–0.7       | Echo send amount                |
| delayTime       | 0.08–0.8 s  | Time between stereo echoes      |
| feedback        | 0–0.72      | Echo feedback gain              |
| reverb          | 0–0.65      | Reverb send amount              |
| vibrato         | 0–1         | Patch vibrato amount            |
| level           | 0.1–1       | Per-voice level                 |
| ratio           | 0.25–8      | FM modulator/carrier ratio      |
| index           | 0–10        | FM modulation index             |
| modDecay        | 0.03–8 s    | FM brightness decay             |

Waveforms and synthesis mode belong to the built-in preset definitions. Edit `patches` in `neon-keys.js` to add your own presets or change waveforms. The API does not load sample files or JSON patches.

## Files

- `neon-keys.js` — reusable audio engine and preset bank.
- `index.html` — demo markup.
- `style.css` — responsive instrument styling.
- `demo.js` — playing controls, arpeggiator, demo scheduler, and visualization.
- `README.md` — usage and API documentation.
- `LICENSE` — MIT license.
- `CHANGELOG.md` — release history.

## Compatibility and implementation notes

Requires Web Audio including `StereoPannerNode` and `AudioParam.cancelAndHoldAtTime`, and browser Pointer Events. A user gesture is required before audio playback. No microphone, network, or account access is requested. Headphones help reveal the stereo effects. The master compressor controls peaks but is not a brick-wall limiter: extreme custom patches, resonance, and stacked notes can still clip; lower the master level if needed.

This is native-node synthesis, not a worklet or sample player. Polyphony and effects consume CPU on mobile devices; reduce `maxVoices` if needed. Background tabs can suspend browser audio/timers. FM at high pitches or modulation indices can produce digital aliasing; use moderate index/ratio settings. Manual browser and device listening remains useful for tone tuning.

## License

MIT. See `LICENSE`.
