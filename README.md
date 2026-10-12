# Neon Keys JS

An ’80s-inspired polyphonic synthesizer written in plain JavaScript and the Web Audio API. Includes an offline-friendly, responsive keyboard demo. Version 1.1.0.

## Play

1. Extract the ZIP, keeping all files together.
2. Open `index.html` in a modern browser.
3. Click **Enable audio**, select a preset, and play the on-screen keyboard or your computer keyboard.

No installation, server, samples, external fonts, dependencies, or build step is required. If your browser restricts local files, run `python3 -m http.server 8000` from this directory and open `http://localhost:8000`.

## Features

- 16 original presets: Silk circuit, Electric ensemble, Skyline brass, Velvet glide, Rubber highway, Orbit six, plus the original Midnight pad, Neon brass, After-hours EP, Crystal glass, Night drive, Laser lead, VHS strings, Arcade pluck, Chrome organ, Dream sequence.
- Analog-style subtractive synthesis: two detuned oscillators, optional sub oscillator, resonant low-pass filtering, amplitude and filter envelopes.
- Pulse/PWM waveform on either analog oscillator, with pulse width, modulation depth, and modulation speed.
- 1–6 unison layers per note, detune spread, and stereo width. The sub oscillator remains centered.
- Mono mode with last-note priority, legato/retrigger envelopes, and adjustable portamento.
- Live cutoff and resonance sweeps on held notes and release tails, with smoothing.
- Two-operator FM synthesis for electric piano, glass bells, and organ textures.
- Stereo chorus, four-stage phaser, damped ping-pong delay, and convolution reverb generated from a deterministic noise impulse.
- 24-note polyphony by default, with oldest released voice preferred for stealing.
- Sustain, ±2-semitone pitch bend, modulation-wheel vibrato, velocity, and octave shift.
- A sixteenth-note arpeggiator with up, down, up/down, random, and one/two-octave modes.
- An original demo progression, live waveform display, and voice count.
- Mouse, multi-touch, computer keyboard, and focused-key Enter input.

These are original patches inspired by broad 1980s sounds, not circuit-accurate emulations or sampled recreations of specific instruments. The original ten patches remain polyphonic by default. Velvet glide, Rubber highway, and Orbit six default to mono; any preset can use either play mode.

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

Enable the arpeggiator, then hold notes. Sustain applies to directly played notes; arpeggiator and demo notes use explicit gate durations. Toggling the arpeggiator clears held notes. Demo playback uses the current preset; bass uses a lower, sparse line and mono presets play a single melodic line. Playing a key stops the demo. Effects may ring briefly after stopping notes.

**Cutoff and resonance update live**, including notes held by sustain and notes in their release tails. A cutoff change shifts the active filter envelope proportionally, keeping its movement intact; resonance updates filter Q directly. Both are smoothed over roughly 20 ms.

Envelope, filter-envelope amount, and oscillator edits apply to a **new voice/phrase**. In mono legato, overlapping keys reuse the existing voice. Glide and legato/retrigger choices affect the next note transition. Effects, volume, pitch bend, and modulation update live.

Changing a preset or play mode clears notes. The demo also clears notes when changing oscillator waveforms or unison layer count so the new architecture can be heard immediately. Detune and filter-envelope controls are disabled for FM presets because those patches do not use them. Effect amounts are send levels; the dry signal stays present.

## Try the new sounds

| Preset            | Try this                                                                          |
| ----------------- | --------------------------------------------------------------------------------- |
| Silk circuit      | Hold a chord to hear slow PWM movement and three unison layers.                   |
| Electric ensemble | Sustained chords reveal four wide layers of pulse/saw strings.                    |
| Skyline brass     | Short chords emphasize the four-layer attack; sweep cutoff while holding.         |
| Velvet glide      | Hold C, add G, then release G. It slides up and returns without a fresh attack.   |
| Rubber highway    | Play low notes; each overlapping key retriggers the envelope with a quick slide.  |
| Orbit six         | Play a melody with overlapping keys for six-layer stereo leads and longer glides. |

**PWM:** choose `Pulse / PWM` on oscillator 1 or 2. Width sets the pulse duty cycle; depth and rate make it move. Depth is internally limited so the instantaneous width stays between 5% and 95%. Setting depth to zero gives a static variable-width pulse. These parameters affect new voices. Square is a fixed 50% pulse and does not use the PWM controls.

**Unison:** each layer contains a complete oscillator pair (or FM pair), detuned across the selected total cents range. Width spreads those layers from left to right. RMS gain compensation and the master compressor balance the layers. Layer count does not consume additional note slots, but does increase CPU use: 24 notes × 6 layers is substantially heavier than 24 single-layer notes.

**Mono:** the newest physical key wins. Releasing it returns to the previous physical key, even when the sustain pedal is on. If no physical key remains and sustain is held, the most recent pedal-held note continues. Pedal-up releases it. Repeated copies of the same pitch have independent input IDs.

**Legato / retrigger:** legato preserves the running envelope across overlapping keys. Retrigger starts a new attack from the current level, avoiding a hard reset to zero. A new phrase gets a fresh attack in either mode. Glide sets the pitch transition duration in seconds and is only used in mono mode; it also remembers the previous pitch across separated notes until All notes off or a preset/mode change. Pitch ramps are exponential in Hz, giving a linear musical interval glide.

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

A `noteOn` call returns a unique input ID (a voice ID in poly mode, a key token in mono mode). Release by ID when multiple inputs may play the same pitch. `noteOff(60)` releases every directly held C4 input; in mono mode, another held key may take over. MIDI numbers are accepted; hardware MIDI input is not included in the demo.

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

## Mono and PWM API

```js
synth.setPreset("glide-lead");
synth.setParam("mode", "mono");
synth.setParam("legato", 1); // 0 = retrigger, 1 = legato
synth.setParam("portamento", 0.18); // 180 ms glide
synth.setParam("wave2", "pulse");
synth.setParam("pulseWidth", 0.4);
synth.setParam("pwmDepth", 0.2);
synth.setParam("pwmRate", 0.7);
synth.setParam("unison", 3);
synth.setParam("unisonDetune", 20);
synth.setParam("stereoSpread", 0.85);

const first = synth.noteOn(60, 0.8);
const second = synth.noteOn(67, 0.8); // Legato glide to G
synth.noteOff(second); // Return to the held C
synth.noteOff(first); // Release the phrase
```

For scheduled mono `noteOn`/`noteOff` events, **submit events in chronological audio-clock order**. Do not queue a far-future note-off before an intervening note-on. Out-of-order mono events throw a `RangeError`. To switch from a scheduled phrase to live playing, call `allNotesOff({ immediate: true })` first. Polyphonic scheduling retains the original behavior.

`playNote` is an explicitly gated sequencer API: in mono mode each event creates a new attack, glides from the preceding pitch, and fades out the previous sequencer note over 5 ms. It does not simulate overlapping finger legato. Use `noteOn`/`noteOff` for that. Keep manual mono input and gated sequence playback separate; the demo switches between them automatically. Sequenced notes ignore sustain.

## Parameters

Numeric `setParam(name, value)` controls accept finite numbers, clamps them to the ranges below, and returns the effective value. Unknown parameters/presets and nonfinite numbers throw errors. MIDI notes are rounded and must lie in 0–127. Velocity is clamped to 0–1; zero does not create a voice.

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

Additional controls:

| Parameter    | Range / values                                    | Meaning                                                     |
| ------------ | ------------------------------------------------- | ----------------------------------------------------------- |
| mode         | `poly`, `mono`                                    | Playing mode; changing it clears notes                      |
| legato       | 0 or 1                                            | Retrigger / legato; rounded to an integer                   |
| portamento   | 0–1.5 s                                           | Mono glide duration; zero uses a 2 ms anti-click transition |
| wave / wave2 | `sine`, `triangle`, `sawtooth`, `square`, `pulse` | Analog oscillator waveforms                                 |
| pulseWidth   | 0.1–0.9                                           | Base pulse duty cycle                                       |
| pwmDepth     | 0–0.4                                             | Duty-cycle modulation; internally limited near the edges    |
| pwmRate      | 0.05–8 Hz                                         | Pulse-width LFO speed                                       |
| unison       | 1–6                                               | Layer count, rounded to an integer                          |
| unisonDetune | 0–50 cents                                        | Total detune span across layers                             |
| stereoSpread | 0–1                                               | Centered to full stereo spread                              |

Synthesis engine selection (analog/FM) belongs to the preset definition. Edit `patches` in `neon-keys.js` to add presets. Waveform/PWM controls only affect analog presets; unison, playing mode, and live filters work with either engine. The API does not load sample files or JSON patches.

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

PWM is generated by subtracting a delayed copy of a browser-generated band-limited sawtooth; a high-pass filter removes its DC offset. The delay follows pitch and portamento. Small vibrato-related width variation is part of this native-node approximation; it is not a circuit model. This remains native-node synthesis, not a worklet or sample player. Polyphony and effects consume CPU on mobile devices; reduce `maxVoices` if needed. Background tabs can suspend browser audio/timers. FM at high pitches or modulation indices can produce digital aliasing; use moderate index/ratio settings. Manual browser and device listening remains useful for tone tuning.

## License

MIT. See `LICENSE`.
