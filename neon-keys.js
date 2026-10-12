/* Neon Keys JS v1.0.0 — MIT License */
(function (root) {
  "use strict";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const finite = (v, name) => {
    if (!Number.isFinite(v)) throw new TypeError(`${name} must be finite`);
    return v;
  };
  const defaults = {
    engine: "analog",
    wave: "sawtooth",
    wave2: "sawtooth",
    detune: 9,
    sub: 0,
    attack: 0.015,
    decay: 0.65,
    sustain: 0.65,
    release: 0.65,
    cutoff: 4200,
    resonance: 0.9,
    envAmount: 2600,
    chorus: 0.35,
    phaser: 0,
    delay: 0.16,
    delayTime: 0.32,
    feedback: 0.32,
    reverb: 0.22,
    ratio: 2,
    index: 3,
    modDecay: 0.5,
    vibrato: 0.08,
    level: 0.7,
  };
  const patches = [
    [
      "midnight",
      "Midnight pad",
      "POLY / WARM",
      "A slow, wide wash of detuned saw waves.",
      {
        attack: 0.45,
        decay: 1.6,
        sustain: 0.75,
        release: 2.4,
        cutoff: 1700,
        envAmount: 1600,
        chorus: 0.7,
        reverb: 0.42,
        level: 0.64,
      },
    ],
    [
      "brass",
      "Neon brass",
      "POLY / BRASS",
      "Bright, punchy filter sweeps with an analog bite.",
      {
        attack: 0.025,
        decay: 0.35,
        sustain: 0.5,
        release: 0.24,
        cutoff: 1400,
        envAmount: 5600,
        resonance: 1.6,
        detune: 7,
        chorus: 0.3,
        reverb: 0.16,
      },
    ],
    [
      "epiano",
      "After-hours EP",
      "FM / KEYS",
      "Bell-like attack that melts into a soft electric piano.",
      {
        engine: "fm",
        attack: 0.003,
        decay: 1.8,
        sustain: 0.18,
        release: 0.75,
        cutoff: 9000,
        envAmount: 0,
        ratio: 1,
        index: 3.8,
        modDecay: 0.3,
        chorus: 0.4,
        reverb: 0.27,
        level: 0.84,
      },
    ],
    [
      "glass",
      "Crystal glass",
      "FM / BELLS",
      "Shimmering, metallic overtones and a long tail.",
      {
        engine: "fm",
        attack: 0.004,
        decay: 2.3,
        sustain: 0.08,
        release: 1.6,
        ratio: 3.5,
        index: 2.4,
        modDecay: 1.3,
        cutoff: 10500,
        envAmount: 0,
        chorus: 0.1,
        delay: 0.3,
        reverb: 0.4,
        level: 0.75,
      },
    ],
    [
      "bass",
      "Night drive",
      "ANALOG / BASS",
      "A tight resonant bass with a rounded sub oscillator.",
      {
        wave2: "square",
        sub: 0.45,
        attack: 0.003,
        decay: 0.22,
        sustain: 0.25,
        release: 0.13,
        cutoff: 430,
        envAmount: 1900,
        resonance: 2.3,
        detune: 3,
        chorus: 0.05,
        delay: 0,
        reverb: 0.05,
        level: 0.8,
      },
    ],
    [
      "lead",
      "Laser lead",
      "ANALOG / LEAD",
      "Focused saw-and-pulse lead with stereo echoes.",
      {
        wave2: "square",
        attack: 0.008,
        decay: 0.35,
        sustain: 0.8,
        release: 0.28,
        cutoff: 4200,
        envAmount: 2700,
        detune: 5,
        chorus: 0.18,
        delay: 0.32,
        reverb: 0.15,
        vibrato: 0.22,
        level: 0.54,
      },
    ],
    [
      "strings",
      "VHS strings",
      "POLY / STRINGS",
      "A soft ensemble with slow phaser movement.",
      {
        attack: 0.7,
        decay: 1.2,
        sustain: 0.82,
        release: 1.9,
        cutoff: 2500,
        envAmount: 1000,
        detune: 13,
        chorus: 0.65,
        phaser: 0.35,
        delay: 0.08,
        reverb: 0.35,
        level: 0.58,
      },
    ],
    [
      "pluck",
      "Arcade pluck",
      "POLY / PLUCK",
      "Fast, sparkling notes made for arpeggios.",
      {
        attack: 0.003,
        decay: 0.3,
        sustain: 0.08,
        release: 0.22,
        cutoff: 900,
        envAmount: 7200,
        resonance: 1.9,
        detune: 6,
        chorus: 0.25,
        delay: 0.4,
        reverb: 0.2,
        level: 0.78,
      },
    ],
    [
      "organ",
      "Chrome organ",
      "FM / ORGAN",
      "A bright, steady tone with swirling phase.",
      {
        engine: "fm",
        ratio: 2,
        index: 1.8,
        modDecay: 8,
        attack: 0.006,
        decay: 0.3,
        sustain: 0.85,
        release: 0.12,
        cutoff: 6400,
        envAmount: 0,
        chorus: 0.25,
        phaser: 0.65,
        delay: 0.08,
        reverb: 0.2,
        level: 0.62,
      },
    ],
    [
      "dream",
      "Dream sequence",
      "POLY / SOFT",
      "Hollow triangle-and-square tones in a roomy cloud.",
      {
        wave: "triangle",
        wave2: "square",
        attack: 0.12,
        decay: 0.8,
        sustain: 0.6,
        release: 1.4,
        cutoff: 1100,
        envAmount: 1300,
        chorus: 0.6,
        delay: 0.28,
        reverb: 0.48,
        level: 0.72,
      },
    ],
  ];
  const PRESETS = Object.freeze(
    patches.map(([id, name, category, description, params]) =>
      Object.freeze({
        id,
        name,
        category,
        description,
        params: Object.freeze({ ...defaults, ...params }),
      }),
    ),
  );
  const ranges = {
    attack: [0.002, 3],
    decay: [0.03, 8],
    sustain: [0, 1],
    release: [0.03, 5],
    cutoff: [80, 16000],
    resonance: [0.1, 10],
    envAmount: [0, 12000],
    detune: [0, 30],
    sub: [0, 1],
    chorus: [0, 1],
    phaser: [0, 1],
    delay: [0, 0.7],
    delayTime: [0.08, 0.8],
    feedback: [0, 0.72],
    reverb: [0, 0.65],
    vibrato: [0, 1],
    level: [0.1, 1],
    ratio: [0.25, 8],
    index: [0, 10],
    modDecay: [0.03, 8],
  };
  class NeonKeys {
    static get presets() {
      return PRESETS;
    }
    constructor({
      context,
      destination,
      maxVoices = 24,
      volume = 0.55,
      preset = "midnight",
    } = {}) {
      const AudioCtx = root.AudioContext || root.webkitAudioContext;
      if (!context && !AudioCtx)
        throw new Error("This browser does not support Web Audio.");
      this.context = context || new AudioCtx();
      this.ownsContext = !context;
      this.maxVoices = Math.round(clamp(finite(maxVoices, "maxVoices"), 1, 64));
      this.voices = new Map();
      this.sequence = 0;
      this.sustained = false;
      this.bend = 0;
      this.mod = 0;
      this.destroyed = false;
      this.nodes = [];
      this.sources = [];
      const c = this.context;
      this.input = this._node(c.createGain());
      this.input.gain.value = 0.28;
      this.output = this._node(c.createGain());
      this.compressor = this._node(c.createDynamicsCompressor());
      Object.assign(this.compressor.threshold, { value: -12 });
      this.compressor.knee.value = 12;
      this.compressor.ratio.value = 8;
      this.compressor.attack.value = 0.003;
      this.compressor.release.value = 0.18;
      this.bus = this._node(c.createGain());
      this.bus.connect(this.compressor);
      this.compressor.connect(this.output);
      this.output.connect(destination || c.destination);
      this.input.connect(this.bus);
      this._effects();
      this.setVolume(volume);
      this.setPreset(preset);
    }
    _node(n) {
      this.nodes.push(n);
      return n;
    }
    _gain(value) {
      const n = this._node(this.context.createGain());
      n.gain.value = value;
      return n;
    }
    _effects() {
      const c = this.context;
      // Two gently modulated delay lines, one on either side of the stereo field.
      this.chorusGain = this._gain(0);
      [-1, 1].forEach((side, i) => {
        const d = this._node(c.createDelay(0.1));
        d.delayTime.value = 0.018 + i * 0.007;
        const p = this._node(c.createStereoPanner());
        p.pan.value = side;
        const l = this._node(c.createOscillator());
        l.frequency.value = 0.65 + i * 0.16;
        const depth = this._gain(0.0035);
        l.connect(depth);
        depth.connect(d.delayTime);
        this.input.connect(d);
        d.connect(p);
        p.connect(this.chorusGain);
        l.start();
        this.sources.push(l);
      });
      this.chorusGain.connect(this.bus);
      this.phaserGain = this._gain(0);
      let prev = this.input;
      const lfo = this._node(c.createOscillator());
      lfo.frequency.value = 0.16;
      [330, 650, 1300, 2600].forEach((f) => {
        const a = this._node(c.createBiquadFilter());
        a.type = "allpass";
        a.frequency.value = f;
        a.Q.value = 0.6;
        const depth = this._gain(f * 0.65);
        lfo.connect(depth);
        depth.connect(a.frequency);
        prev.connect(a);
        prev = a;
      });
      prev.connect(this.phaserGain);
      this.phaserGain.connect(this.bus);
      lfo.start();
      this.sources.push(lfo);
      this.delayGain = this._gain(0);
      this.delayL = this._node(c.createDelay(2));
      this.delayR = this._node(c.createDelay(2));
      this.feedbackL = this._gain(0.3);
      this.feedbackR = this._gain(0.3);
      const dampL = this._node(c.createBiquadFilter()),
        dampR = this._node(c.createBiquadFilter());
      dampL.frequency.value = dampR.frequency.value = 4200;
      const panL = this._node(c.createStereoPanner()),
        panR = this._node(c.createStereoPanner());
      panL.pan.value = -0.8;
      panR.pan.value = 0.8;
      this.input.connect(this.delayGain);
      this.delayGain.connect(this.delayL);
      this.delayL.connect(panL);
      panL.connect(this.bus);
      this.delayR.connect(panR);
      panR.connect(this.bus);
      this.delayL.connect(dampL);
      dampL.connect(this.feedbackL);
      this.feedbackL.connect(this.delayR);
      this.delayR.connect(dampR);
      dampR.connect(this.feedbackR);
      this.feedbackR.connect(this.delayL);
      this.reverbGain = this._gain(0);
      const verb = this._node(c.createConvolver());
      const length = Math.floor(c.sampleRate * 2.6);
      const buffer = c.createBuffer(2, length, c.sampleRate);
      let seed = 808;
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        let low = 0;
        for (let i = 0; i < length; i++) {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          low = 0.6 * low + 0.4 * ((seed / 4294967296) * 2 - 1);
          data[i] =
            low * Math.pow(1 - i / length, 2.8) * (i < 100 ? i / 100 : 1);
        }
      }
      verb.buffer = buffer;
      this.input.connect(this.reverbGain);
      this.reverbGain.connect(verb);
      verb.connect(this.bus);
    }
    async resume() {
      if (this.destroyed) throw new Error("Synth is disposed.");
      if (this.context.state === "suspended") await this.context.resume();
    }
    setVolume(value) {
      this.volume = clamp(finite(value, "volume"), 0, 1);
      this.output.gain.setTargetAtTime(
        this.volume,
        this.context.currentTime,
        0.02,
      );
    }
    setPreset(id) {
      const p = PRESETS.find((p) => p.id === id);
      if (!p) throw new RangeError(`Unknown preset: ${id}`);
      this.preset = id;
      this.params = { ...p.params };
      this._updateEffects();
      return this.getParams();
    }
    getParams() {
      return { ...this.params };
    }
    setParam(name, value) {
      if (!ranges[name]) throw new RangeError(`Unknown parameter: ${name}`);
      const [a, b] = ranges[name];
      this.params[name] = clamp(finite(value, name), a, b);
      this._updateEffects();
      return this.params[name];
    }
    _updateEffects() {
      const p = this.params,
        t = this.context.currentTime;
      [
        [this.chorusGain.gain, p.chorus * 0.5],
        [this.phaserGain.gain, p.phaser * 0.65],
        [this.delayGain.gain, p.delay],
        [this.reverbGain.gain, p.reverb],
        [this.delayL.delayTime, p.delayTime],
        [this.delayR.delayTime, p.delayTime],
        [this.feedbackL.gain, p.feedback],
        [this.feedbackR.gain, p.feedback],
      ].forEach(([a, v]) => a.setTargetAtTime(v, t, 0.025));
    }
    _time(when) {
      return Math.max(
        this.context.currentTime,
        when === undefined ? this.context.currentTime : finite(when, "when"),
      );
    }
    noteOn(note, velocity = 0.8, { when } = {}) {
      if (this.destroyed) throw new Error("Synth is disposed.");
      note = Math.round(finite(note, "note"));
      if (note < 0 || note > 127)
        throw new RangeError("MIDI note must be between 0 and 127.");
      velocity = clamp(finite(velocity, "velocity"), 0, 1);
      if (velocity === 0) return null;
      const c = this.context,
        t = this._time(when),
        p = { ...this.params },
        hz = 440 * Math.pow(2, (note - 69) / 12);
      if (this.voices.size >= this.maxVoices) {
        const candidates = [...this.voices.values()];
        const victim = candidates.find((v) => v.released) || candidates[0];
        this._kill(victim);
      }
      const amp = c.createGain(),
        filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = p.resonance;
      const maxF = Math.min(16000, c.sampleRate * 0.44),
        base = Math.min(p.cutoff, maxF),
        peak = Math.min(maxF, base + p.envAmount * (0.3 + 0.7 * velocity));
      filter.frequency.setValueAtTime(base, t);
      filter.frequency.linearRampToValueAtTime(peak, t + p.attack);
      filter.frequency.exponentialRampToValueAtTime(
        Math.min(maxF, Math.max(80, base + p.envAmount * p.sustain * 0.22)),
        t + p.attack + p.decay,
      );
      const level = p.level * Math.pow(velocity, 1.35);
      amp.gain.setValueAtTime(0, t);
      amp.gain.linearRampToValueAtTime(level, t + p.attack);
      amp.gain.linearRampToValueAtTime(
        level * p.sustain,
        t + p.attack + p.decay,
      );
      filter.connect(amp);
      amp.connect(this.input);
      const v = {
        id: `v${++this.sequence}`,
        note,
        start: t,
        params: p,
        amp,
        filter,
        osc: [],
        nodes: [amp, filter],
        pitch: [],
        released: false,
        held: false,
      };
      const oscillator = (
        type,
        freq,
        gain,
        detune = 0,
        destination = filter,
      ) => {
        const o = c.createOscillator(),
          g = c.createGain();
        o.type = type;
        o.frequency.value = freq;
        o.detune.value = detune + this.bend * 200;
        g.gain.value = gain;
        o.connect(g);
        g.connect(destination);
        o.start(t);
        v.osc.push(o);
        v.nodes.push(o, g);
        v.pitch.push({ param: o.detune, base: detune });
        return o;
      };
      if (p.engine === "fm") {
        const carrier = oscillator("sine", hz, 1);
        const mod = c.createOscillator(),
          depth = c.createGain();
        mod.frequency.value = hz * p.ratio;
        mod.detune.value = this.bend * 200;
        depth.gain.setValueAtTime(hz * p.index * (0.2 + 0.8 * velocity), t);
        depth.gain.exponentialRampToValueAtTime(
          Math.max(0.01, hz * p.index * 0.08),
          t + p.modDecay,
        );
        mod.connect(depth);
        depth.connect(carrier.frequency);
        mod.start(t);
        v.osc.push(mod);
        v.nodes.push(mod, depth);
        v.pitch.push({ param: mod.detune, base: 0 });
      } else {
        oscillator(p.wave, hz, 0.48, -p.detune / 2);
        oscillator(p.wave2, hz, 0.48, p.detune / 2);
        if (p.sub) oscillator("sine", hz / 2, p.sub);
      }
      const vibrato = c.createOscillator(),
        depth = c.createGain();
      vibrato.frequency.value = 5.2;
      depth.gain.value = p.vibrato * 15 + this.mod * 35;
      vibrato.connect(depth);
      v.pitch.forEach((x) => depth.connect(x.param));
      vibrato.start(t);
      v.osc.push(vibrato);
      v.nodes.push(vibrato, depth);
      v.modDepth = depth;
      v.osc[0].onended = () => {
        v.nodes.forEach((n) => n.disconnect());
        this.voices.delete(v.id);
      };
      this.voices.set(v.id, v);
      return v.id;
    }
    noteOff(noteOrId, { when } = {}) {
      const t = this._time(when);
      for (const v of this.voices.values())
        if ((v.id === noteOrId || v.note === noteOrId) && !v.released) {
          if (this.sustained) v.held = true;
          else this._release(v, t);
        }
    }
    _hold(param, t) {
      param.cancelAndHoldAtTime(t);
    }
    _release(v, t, seconds = v.params.release) {
      if (v.released) return;
      v.released = true;
      v.held = false;
      t = Math.max(t, v.start + 0.002);
      this._hold(v.amp.gain, t);
      v.amp.gain.linearRampToValueAtTime(0, t + seconds);
      v.osc.forEach((o) => o.stop(t + seconds + 0.02));
    }
    playNote(note, duration = 0.3, velocity = 0.8, { when } = {}) {
      const t = this._time(when);
      duration = clamp(finite(duration, "duration"), 0.01, 60);
      const id = this.noteOn(note, velocity, { when: t });
      if (id) this._release(this.voices.get(id), t + duration);
      return id;
    }
    setSustain(on) {
      this.sustained = Boolean(on);
      if (!this.sustained)
        for (const v of this.voices.values())
          if (v.held) this._release(v, this.context.currentTime);
    }
    setPitchBend(value) {
      this.bend = clamp(finite(value, "pitch bend"), -1, 1);
      const t = this.context.currentTime;
      for (const v of this.voices.values())
        v.pitch.forEach((x) =>
          x.param.setTargetAtTime(x.base + this.bend * 200, t, 0.015),
        );
    }
    setModulation(value) {
      this.mod = clamp(finite(value, "modulation"), 0, 1);
      for (const v of this.voices.values())
        v.modDepth.gain.setTargetAtTime(
          v.params.vibrato * 15 + this.mod * 35,
          this.context.currentTime,
          0.02,
        );
    }
    _kill(v) {
      const t = this.context.currentTime;
      v.amp.gain.cancelScheduledValues(t);
      v.amp.gain.setTargetAtTime(0, t, 0.003);
      v.osc.forEach((o) => {
        try {
          o.stop(t + 0.02);
        } catch {}
      });
      this.voices.delete(v.id);
    }
    allNotesOff({ immediate = false } = {}) {
      this.sustained = false;
      for (const v of this.voices.values()) {
        if (immediate || v.start > this.context.currentTime) this._kill(v);
        else this._release(v, this.context.currentTime);
      }
    }
    async dispose() {
      if (this.destroyed) return;
      const remaining = [...this.voices.values()];
      this.allNotesOff({ immediate: true });
      remaining.forEach((v) => v.nodes.forEach((n) => n.disconnect()));
      this.voices.clear();
      this.sources.forEach((o) => o.stop());
      this.nodes.forEach((n) => n.disconnect());
      this.destroyed = true;
      if (this.ownsContext) await this.context.close();
    }
  }
  root.NeonKeys = NeonKeys;
  if (typeof module !== "undefined" && module.exports)
    module.exports = NeonKeys;
})(typeof window !== "undefined" ? window : globalThis);
