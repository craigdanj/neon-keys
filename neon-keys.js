/* Neon Keys JS v1.1.0 — MIT License */
(function (root) {
  "use strict";
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const finite = (v, name) => {
    if (!Number.isFinite(v)) throw new TypeError(`${name} must be finite`);
    return v;
  };
  const defaults = {
    mode: "poly",
    legato: 1,
    portamento: 0,
    unison: 1,
    unisonDetune: 18,
    stereoSpread: 0.75,
    pulseWidth: 0.5,
    pwmDepth: 0.18,
    pwmRate: 0.6,
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
  patches.push(
    [
      "pwm-silk",
      "Silk circuit",
      "PWM / PAD",
      "Slow pulse movement, three layers, and a soft stereo glow.",
      {
        wave: "pulse",
        wave2: "pulse",
        pulseWidth: 0.42,
        pwmDepth: 0.22,
        pwmRate: 0.34,
        unison: 3,
        unisonDetune: 14,
        stereoSpread: 0.85,
        attack: 0.48,
        decay: 1.4,
        sustain: 0.78,
        release: 2.1,
        cutoff: 2400,
        envAmount: 1400,
        chorus: 0.3,
        delay: 0.12,
        reverb: 0.36,
        level: 0.68,
      },
    ],
    [
      "pwm-strings",
      "Electric ensemble",
      "PWM / STRINGS",
      "Shifting pulse strings with a wide, gently detuned ensemble.",
      {
        wave: "pulse",
        wave2: "sawtooth",
        pulseWidth: 0.32,
        pwmDepth: 0.17,
        pwmRate: 0.72,
        unison: 4,
        unisonDetune: 20,
        stereoSpread: 1,
        attack: 0.24,
        decay: 1,
        sustain: 0.8,
        release: 1.5,
        cutoff: 3600,
        envAmount: 1800,
        chorus: 0.25,
        phaser: 0.2,
        reverb: 0.28,
        level: 0.65,
      },
    ],
    [
      "unison-brass",
      "Skyline brass",
      "UNISON / BRASS",
      "Four bold layers with a bright, punchy filter attack.",
      {
        unison: 4,
        unisonDetune: 24,
        stereoSpread: 0.8,
        attack: 0.018,
        decay: 0.4,
        sustain: 0.5,
        release: 0.3,
        cutoff: 1900,
        envAmount: 5700,
        resonance: 1.2,
        chorus: 0.15,
        reverb: 0.2,
        level: 0.73,
      },
    ],
    [
      "glide-lead",
      "Velvet glide",
      "MONO / LEGATO",
      "Hold one key and play another to glide without a new attack.",
      {
        mode: "mono",
        legato: 1,
        portamento: 0.16,
        wave: "sawtooth",
        wave2: "pulse",
        pulseWidth: 0.38,
        pwmDepth: 0.1,
        pwmRate: 0.9,
        unison: 3,
        unisonDetune: 16,
        stereoSpread: 0.7,
        attack: 0.035,
        decay: 0.6,
        sustain: 0.75,
        release: 0.3,
        cutoff: 3700,
        envAmount: 2300,
        delay: 0.3,
        reverb: 0.2,
        chorus: 0.12,
        level: 0.65,
      },
    ],
    [
      "rubber-bass",
      "Rubber highway",
      "MONO / BASS",
      "A rounded pulse bass with quick slides and a fresh attack per key.",
      {
        mode: "mono",
        legato: 0,
        portamento: 0.075,
        wave: "pulse",
        wave2: "sawtooth",
        pulseWidth: 0.3,
        pwmDepth: 0.1,
        pwmRate: 0.45,
        unison: 2,
        unisonDetune: 7,
        stereoSpread: 0.15,
        sub: 0.35,
        attack: 0.006,
        decay: 0.24,
        sustain: 0.35,
        release: 0.13,
        cutoff: 560,
        envAmount: 2600,
        resonance: 2,
        chorus: 0,
        delay: 0.05,
        reverb: 0.04,
        level: 0.78,
      },
    ],
    [
      "orbit-lead",
      "Orbit six",
      "UNISON / LEAD",
      "Six detuned layers, wide stereo, and a long singing glide.",
      {
        mode: "mono",
        legato: 1,
        portamento: 0.3,
        unison: 6,
        unisonDetune: 32,
        stereoSpread: 1,
        attack: 0.025,
        decay: 0.6,
        sustain: 0.85,
        release: 0.65,
        cutoff: 5400,
        envAmount: 1900,
        chorus: 0.1,
        delay: 0.3,
        reverb: 0.26,
        level: 0.68,
      },
    ],
  );
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
    legato: [0, 1],
    portamento: [0, 1.5],
    unison: [1, 6],
    unisonDetune: [0, 50],
    stereoSpread: [0, 1],
    pulseWidth: [0.1, 0.9],
    pwmDepth: [0, 0.4],
    pwmRate: [0.05, 8],
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
      this.monoKeys = [];
      this.monoVoice = null;
      this.lastMonoHz = null;
      this.monoEventTime = -Infinity;
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
      if (this.params) this.allNotesOff({ immediate: true });
      this.preset = id;
      this.params = { ...p.params };
      this._updateEffects();
      return this.getParams();
    }
    getParams() {
      return { ...this.params };
    }
    setParam(name, value) {
      if (name === "mode") {
        if (!["poly", "mono"].includes(value))
          throw new RangeError("mode must be poly or mono");
        if (value !== this.params.mode) this.allNotesOff({ immediate: true });
        this.params.mode = value;
        return value;
      }
      if (name === "wave" || name === "wave2") {
        if (
          !["sine", "triangle", "sawtooth", "square", "pulse"].includes(value)
        )
          throw new RangeError("Unknown waveform");
        this.params[name] = value;
        return value;
      }
      if (!ranges[name]) throw new RangeError(`Unknown parameter: ${name}`);
      const [a, b] = ranges[name];
      this.params[name] = clamp(finite(value, name), a, b);
      if (name === "unison" || name === "legato")
        this.params[name] = Math.round(this.params[name]);
      // Shift the running filter envelope rather than discarding its contour.
      const t = this.context.currentTime;
      if (name === "cutoff" || name === "resonance")
        for (const v of this.voices.values()) {
          if (name === "cutoff")
            v.filter.detune.setTargetAtTime(
              1200 * Math.log2(this.params.cutoff / v.filterBase),
              t,
              0.02,
            );
          else v.filter.Q.setTargetAtTime(this.params.resonance, t, 0.02);
        }
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
    _validateNote(note, velocity) {
      if (this.destroyed) throw new Error("Synth is disposed.");
      note = Math.round(finite(note, "note"));
      if (note < 0 || note > 127)
        throw new RangeError("MIDI note must be between 0 and 127.");
      return [note, clamp(finite(velocity, "velocity"), 0, 1)];
    }
    _monoTime(t) {
      // A mono stack is a performance timeline. Submit future events in time order.
      if (t + 0.00001 < this.monoEventTime)
        throw new RangeError(
          "Schedule mono note events in chronological order; cancel with allNotesOff before live input.",
        );
      this.monoEventTime = t;
    }
    noteOn(note, velocity = 0.8, { when } = {}) {
      [note, velocity] = this._validateNote(note, velocity);
      if (!velocity) return null;
      const t = this._time(when);
      if (this.params.mode !== "mono")
        return this._createVoice(note, velocity, t).id;
      this._monoTime(t);
      const key = { id: `m${++this.sequence}`, note, velocity, down: true };
      this.monoKeys.push(key);
      const v = this.monoVoice;
      if (v && !v.released && this.voices.has(v.id)) {
        this._retune(v, note, t, this.params.portamento);
        if (!this.params.legato) this._envelope(v, velocity, t, true);
        v.held = false;
      } else {
        if (v) this._shorten(v, t);
        this.monoVoice = this._createVoice(note, velocity, t, this.lastMonoHz);
      }
      this.lastMonoHz = 440 * Math.pow(2, (note - 69) / 12);
      return key.id;
    }
    _envelope(v, velocity, t, retrigger = false) {
      const p = v.params,
        maxF = Math.min(16000, this.context.sampleRate * 0.44);
      const ampFrom = retrigger ? this._ampAt(v, t) : 0;
      const filterFrom = retrigger
        ? this._shapeAt(v.filterPlan, t, true)
        : Math.min(p.cutoff, maxF);
      if (retrigger) {
        v.amp.gain.cancelAndHoldAtTime(t);
        v.filter.frequency.cancelAndHoldAtTime(t);
      }
      v.amp.gain.setValueAtTime(ampFrom, t);
      v.filter.frequency.setValueAtTime(filterFrom, t);
      const level = p.level * Math.pow(velocity, 1.35);
      v.ampPlan = {
        start: t,
        from: ampFrom,
        peak: level,
        end: level * p.sustain,
        attack: p.attack,
        decay: p.decay,
      };
      v.filterPlan = {
        start: t,
        from: filterFrom,
        peak: Math.min(maxF, p.cutoff + p.envAmount * (0.3 + 0.7 * velocity)),
        end: Math.min(
          maxF,
          Math.max(80, p.cutoff + p.envAmount * p.sustain * 0.22),
        ),
        attack: p.attack,
        decay: p.decay,
      };
      v.releasePlan = null;
      v.amp.gain.linearRampToValueAtTime(level, t + p.attack);
      v.amp.gain.linearRampToValueAtTime(
        level * p.sustain,
        t + p.attack + p.decay,
      );
      if (!retrigger)
        v.filter.frequency.setValueAtTime(Math.min(p.cutoff, maxF), t);
      v.filter.frequency.linearRampToValueAtTime(
        Math.min(maxF, p.cutoff + p.envAmount * (0.3 + 0.7 * velocity)),
        t + p.attack,
      );
      v.filter.frequency.exponentialRampToValueAtTime(
        Math.min(maxF, Math.max(80, p.cutoff + p.envAmount * p.sustain * 0.22)),
        t + p.attack + p.decay,
      );
      v.envelopeStart = t;
      v.fmDepths.forEach(({ gain, ratio }) => {
        const hz = 440 * Math.pow(2, (v.note - 69) / 12) * ratio;
        if (retrigger) gain.cancelAndHoldAtTime(t);
        gain.setValueAtTime(
          Math.max(0.001, hz * p.index * (0.2 + 0.8 * velocity)),
          t,
        );
        gain.exponentialRampToValueAtTime(
          Math.max(0.001, hz * p.index * 0.08),
          t + p.modDecay,
        );
      });
    }
    _createVoice(note, velocity, t, fromHz = null) {
      const c = this.context,
        p = { ...this.params },
        hz = 440 * Math.pow(2, (note - 69) / 12);
      if (this.voices.size >= this.maxVoices) {
        const list = [...this.voices.values()];
        this._kill(list.find((v) => v.released) || list[0]);
      }
      const amp = c.createGain(),
        filter = c.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.value = p.resonance;
      filter.connect(amp);
      amp.connect(this.input);
      const v = {
        id: `v${++this.sequence}`,
        note,
        start: t,
        params: p,
        amp,
        filter,
        filterBase: p.cutoff,
        frequencyPlan: { start: t, end: t, from: hz, to: hz },
        osc: [],
        nodes: [amp, filter],
        pitch: [],
        tuning: [],
        pwm: [],
        fmDepths: [],
        released: false,
        held: false,
      };
      const oscillator = (type, ratio, gain, detune, destination) => {
        const o = c.createOscillator(),
          g = c.createGain();
        o.type = type === "pulse" ? "sawtooth" : type;
        o.frequency.setValueAtTime(hz * ratio, t);
        o.detune.value = detune + this.bend * 200;
        g.gain.value = gain;
        if (type === "pulse") {
          // A saw minus its delayed copy is a variable-width pulse. The oscillator
          // remains browser band-limited; no main-thread waveform replacement.
          const delay = c.createDelay(0.25),
            invert = c.createGain(),
            dc = c.createBiquadFilter();
          invert.gain.value = -1;
          dc.type = "highpass";
          dc.frequency.value = 15;
          dc.Q.value = 0.5;
          const lfo = c.createOscillator(),
            depth = c.createGain();
          lfo.frequency.value = p.pwmRate;
          const pitchHz =
            hz * ratio * Math.pow(2, (detune + this.bend * 200) / 1200);
          const width = p.pulseWidth,
            amount = Math.min(p.pwmDepth, width - 0.05, 0.95 - width);
          delay.delayTime.setValueAtTime(width / pitchHz, t);
          depth.gain.setValueAtTime(amount / pitchHz, t);
          o.connect(dc);
          o.connect(delay);
          delay.connect(invert);
          invert.connect(dc);
          dc.connect(g);
          lfo.connect(depth);
          depth.connect(delay.delayTime);
          lfo.start(t);
          v.osc.push(lfo);
          v.nodes.push(delay, invert, dc, lfo, depth);
          v.pwm.push({
            delay: delay.delayTime,
            depth: depth.gain,
            ratio,
            detune,
            width,
            amount,
          });
        } else o.connect(g);
        g.connect(destination);
        o.start(t);
        v.osc.push(o);
        v.nodes.push(o, g);
        v.pitch.push({ param: o.detune, base: detune });
        v.tuning.push({ param: o.frequency, ratio });
        return o;
      };
      for (let layer = 0; layer < p.unison; layer++) {
        const spread = p.unison === 1 ? 0 : (layer / (p.unison - 1)) * 2 - 1;
        const cents = (spread * p.unisonDetune) / 2;
        let pan = filter;
        if (p.unison > 1) {
          pan = c.createStereoPanner();
          pan.pan.value = spread * p.stereoSpread;
          pan.connect(filter);
          v.nodes.push(pan);
        }
        // RMS compensation avoids making wide unison quieter; the master
        // compressor catches coherent attack peaks. One layer preserves v1.0.
        const gain = 1 / Math.sqrt(p.unison);
        if (p.engine === "fm") {
          const carrier = oscillator("sine", 1, gain, cents, pan);
          const mod = c.createOscillator(),
            depth = c.createGain();
          mod.frequency.setValueAtTime(hz * p.ratio, t);
          mod.detune.value = cents + this.bend * 200;
          mod.connect(depth);
          depth.connect(carrier.frequency);
          mod.start(t);
          v.osc.push(mod);
          v.nodes.push(mod, depth);
          v.pitch.push({ param: mod.detune, base: cents });
          v.tuning.push({ param: mod.frequency, ratio: p.ratio });
          v.fmDepths.push({ gain: depth.gain, ratio: 1 });
        } else {
          oscillator(p.wave, 1, 0.48 * gain, cents - p.detune / 2, pan);
          oscillator(p.wave2, 1, 0.48 * gain, cents + p.detune / 2, pan);
        }
      }
      if (p.engine !== "fm" && p.sub) oscillator("sine", 0.5, p.sub, 0, filter);
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
      this._envelope(v, velocity, t);
      if (fromHz && p.portamento > 0) {
        v.frequencyPlan = { start: t, end: t, from: fromHz, to: fromHz };
        v.tuning.forEach((x) => x.param.setValueAtTime(fromHz * x.ratio, t));
        this._syncPWM(v, t, 0, fromHz);
        this._retune(v, note, t, p.portamento);
      }
      v.osc[0].onended = () => {
        v.nodes.forEach((n) => n.disconnect());
        this.voices.delete(v.id);
        if (this.monoVoice === v) this.monoVoice = null;
      };
      this.voices.set(v.id, v);
      return v;
    }
    _frequencyAt(v, t) {
      const p = v.frequencyPlan;
      if (t <= p.start) return p.from;
      if (t >= p.end) return p.to;
      return (
        p.from * Math.pow(p.to / p.from, (t - p.start) / (p.end - p.start))
      );
    }
    _shapeAt(p, t, exponential = false) {
      if (!p) return 0;
      const elapsed = Math.max(0, t - p.start);
      if (elapsed < p.attack)
        return p.from + ((p.peak - p.from) * elapsed) / p.attack;
      if (elapsed >= p.attack + p.decay) return p.end;
      const x = (elapsed - p.attack) / p.decay;
      return exponential
        ? p.peak * Math.pow(p.end / p.peak, x)
        : p.peak + (p.end - p.peak) * x;
    }
    _ampAt(v, t) {
      const r = v.releasePlan;
      if (r && t >= r.start)
        return r.from * Math.max(0, 1 - (t - r.start) / (r.end - r.start));
      return this._shapeAt(v.ampPlan, t);
    }
    _syncPWM(
      v,
      t,
      glide = 0,
      hz = this._frequencyAt(v, t),
      fromHz = this._frequencyAt(v, t),
    ) {
      t = Math.max(t, v.start);
      v.pwm.forEach((x) => {
        const ratio =
          x.ratio * Math.pow(2, (x.detune + this.bend * 200) / 1200);
        [
          [x.delay, x.width],
          [x.depth, x.amount],
        ].forEach(([param, amount]) => {
          param.cancelAndHoldAtTime(t);
          param.setValueAtTime(amount / (fromHz * ratio), t);
          if (glide > 0 && amount > 0)
            param.exponentialRampToValueAtTime(
              amount / (hz * ratio),
              t + glide,
            );
          else param.setValueAtTime(amount / (hz * ratio), t);
        });
      });
    }
    _retune(v, note, t, glide) {
      const hz = 440 * Math.pow(2, (note - 69) / 12),
        from = this._frequencyAt(v, t);
      v.note = note;
      // Explicitly anchor the start: a ramp must begin on the new key event,
      // not on the preceding automation event earlier in the phrase.
      const duration = Math.max(0.002, glide);
      v.tuning.forEach((x) => {
        x.param.cancelAndHoldAtTime(t);
        x.param.setValueAtTime(from * x.ratio, t);
        x.param.exponentialRampToValueAtTime(hz * x.ratio, t + duration);
      });
      this._syncPWM(v, t, duration, hz, from);
      v.frequencyPlan = { start: t, end: t + duration, from, to: hz };
    }
    noteOff(noteOrId, { when } = {}) {
      const t = this._time(when);
      if (this.params.mode === "mono") {
        const matches = this.monoKeys.filter(
          (k) => k.id === noteOrId || k.note === noteOrId,
        );
        if (!matches.length) return;
        this._monoTime(t);
        matches.forEach((k) => (k.down = false));
        if (!this.sustained)
          this.monoKeys = this.monoKeys.filter((k) => k.down);
        this._resolveMono(t);
        return;
      }
      for (const v of this.voices.values())
        if ((v.id === noteOrId || v.note === noteOrId) && !v.released) {
          if (this.sustained) v.held = true;
          else this._release(v, t);
        }
    }
    _resolveMono(t) {
      const v = this.monoVoice;
      if (!v || v.released) return;
      // Physical held keys take priority over notes held only by the pedal.
      const key =
        [...this.monoKeys].reverse().find((k) => k.down) ||
        this.monoKeys[this.monoKeys.length - 1];
      if (key) {
        if (key.note !== v.note) {
          this._retune(v, key.note, t, this.params.portamento);
          if (!this.params.legato) this._envelope(v, key.velocity, t, true);
        }
        v.held = !key.down;
        this.lastMonoHz = 440 * Math.pow(2, (key.note - 69) / 12);
      } else this._release(v, t);
    }
    _hold(param, t) {
      param.cancelAndHoldAtTime(t);
    }
    _release(v, t, seconds = v.params.release) {
      if (v.released) return;
      v.released = true;
      v.held = false;
      t = Math.max(t, v.start + 0.002);
      const from = this._ampAt(v, t);
      this._hold(v.amp.gain, t);
      v.amp.gain.setValueAtTime(from, t);
      v.amp.gain.linearRampToValueAtTime(0, t + seconds);
      v.releasePlan = { start: t, end: t + seconds, from };
      v.stopTime = t + seconds + 0.02;
      v.osc.forEach((o) => o.stop(v.stopTime));
    }
    playNote(note, duration = 0.3, velocity = 0.8, { when } = {}) {
      [note, velocity] = this._validateNote(note, velocity);
      const t = this._time(when);
      duration = clamp(finite(duration, "duration"), 0.01, 60);
      if (!velocity) return null;
      if (this.params.mode === "mono") {
        // Gated sequences are explicit events; noteOn/noteOff is the legato API.
        this._monoTime(t);
        for (const old of this.voices.values())
          if (old.sequenceMono) this._shorten(old, t);
        const v = this._createVoice(note, velocity, t, this.lastMonoHz);
        v.sequenceMono = true;
        this.lastMonoHz = 440 * Math.pow(2, (note - 69) / 12);
        this._release(v, t + duration);
        return v.id;
      }
      const v = this._createVoice(note, velocity, t);
      this._release(v, t + duration);
      return v.id;
    }
    _shorten(v, t) {
      if (v.stopTime !== undefined && v.stopTime <= t) return;
      const from = this._ampAt(v, t);
      v.amp.gain.cancelAndHoldAtTime(t);
      v.amp.gain.setValueAtTime(from, t);
      v.amp.gain.linearRampToValueAtTime(0, t + 0.005);
      v.releasePlan = { start: t, end: t + 0.005, from };
      v.osc.forEach((o) => o.stop(t + 0.007));
      v.stopTime = t + 0.007;
    }
    setSustain(on) {
      this.sustained = Boolean(on);
      if (!this.sustained) {
        if (this.params.mode === "mono") {
          this.monoKeys = this.monoKeys.filter((k) => k.down);
          this._resolveMono(this.context.currentTime);
        } else
          for (const v of this.voices.values())
            if (v.held) this._release(v, this.context.currentTime);
      }
    }
    setPitchBend(value) {
      this.bend = clamp(finite(value, "pitch bend"), -1, 1);
      const t = this.context.currentTime;
      for (const v of this.voices.values()) {
        v.pitch.forEach((x) =>
          x.param.setTargetAtTime(x.base + this.bend * 200, t, 0.015),
        );
        this._syncPWM(v, t, 0.03);
      }
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
      this.monoKeys = [];
      this.monoVoice = null;
      this.lastMonoHz = null;
      this.monoEventTime = -Infinity;
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
