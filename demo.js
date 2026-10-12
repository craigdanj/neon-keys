/* Neon Keys demo — MIT License */
"use strict";
const $ = (id) => document.getElementById(id);
let synth,
  initPromise,
  octave = 0,
  sustainLatch = false,
  spaceHeld = false,
  arpOn = false,
  demoOn = false,
  nextTick = 0,
  step = 0,
  animation;
const inputs = new Map(),
  keys = new Map(),
  bindings = "awsedftgyhujkolp;".split("");
const boundNotes = [
  60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76,
];
const patchList = NeonKeys.presets;
const preset = $("preset");
patchList.forEach((p) => {
  const o = document.createElement("option");
  o.value = p.id;
  o.textContent = p.name;
  preset.append(o);
});
const controls = [
  ["attack", "Attack", 0.002, 3, "log", "s"],
  ["decay", "Decay", 0.03, 8, "log", "s"],
  ["sustain", "Sustain", 0, 1, "linear", "%"],
  ["release", "Release", 0.03, 5, "log", "s"],
  ["cutoff", "Cutoff", 80, 16000, "log", "Hz"],
  ["resonance", "Resonance", 0.1, 10, "linear", ""],
  ["detune", "Detune", 0, 30, "linear", "ct"],
  ["envAmount", "Filter env", 0, 12000, "linear", "Hz"],
  ["chorus", "Chorus", 0, 1, "linear", "%"],
  ["phaser", "Phaser", 0, 1, "linear", "%"],
  ["delay", "Delay", 0, 0.7, "linear", "%"],
  ["reverb", "Reverb", 0, 0.65, "linear", "%"],
];
controls.push(
  ["pulseWidth", "Pulse width", 0.1, 0.9, "linear", "%"],
  ["pwmDepth", "PWM depth", 0, 0.4, "linear", "%"],
  ["pwmRate", "PWM rate", 0.05, 8, "log", "rate"],
  ["unisonDetune", "Uni. detune", 0, 50, "linear", "ct"],
  ["stereoSpread", "Stereo width", 0, 1, "linear", "%"],
  ["portamento", "Glide", 0, 1.5, "linear", "s"],
);
const toValue = (spec, x) =>
  spec[4] === "log"
    ? spec[2] * Math.pow(spec[3] / spec[2], x)
    : spec[2] + (spec[3] - spec[2]) * x;
const toPosition = (spec, v) =>
  spec[4] === "log"
    ? Math.log(v / spec[2]) / Math.log(spec[3] / spec[2])
    : (v - spec[2]) / (spec[3] - spec[2]);
const format = (v, unit) =>
  unit === "rate"
    ? `${v.toFixed(2)} Hz`
    : unit === "%"
      ? `${Math.round(v * 100)}%`
      : unit === "Hz"
        ? v >= 1000
          ? `${(v / 1000).toFixed(1)}k Hz`
          : `${Math.round(v)} Hz`
        : unit === "s"
          ? v < 0.1
            ? `${Math.round(v * 1000)} ms`
            : `${v < 1 ? v.toFixed(2) : v.toFixed(1)} s`
          : `${v.toFixed(unit === "ct" ? 0 : 1)}${unit ? " " + unit : ""}`;
const edited = {};
controls.forEach((spec) => {
  const [id, label] = spec;
  const c = document.createElement("div");
  c.className = "control";
  c.innerHTML = `<label for="param-${id}">${label}</label><div class="dial"></div><input id="param-${id}" type="range" min="0" max="1" step=".001" aria-describedby="value-${id}"><output id="value-${id}"></output>`;
  $(
    controls.indexOf(spec) < 8
      ? "toneControls"
      : controls.indexOf(spec) < 12
        ? "effectControls"
        : "motionControls",
  ).append(c);
  c.querySelector("input").addEventListener("input", (e) => {
    const value = toValue(spec, +e.target.value);
    edited[id] = value;
    if (synth) synth.setParam(id, value);
    updateControl(spec, value);
  });
});
function updateControl(spec, value) {
  const el = $(`param-${spec[0]}`);
  el.value = toPosition(spec, value);
  el.parentElement.style.setProperty("--angle", `${+el.value * 270}deg`);
  $(`value-${spec[0]}`).textContent = format(value, spec[5]);
  el.setAttribute("aria-valuetext", format(value, spec[5]));
}
patchList.slice(0, 5).forEach((p, i) => {
  const b = document.createElement("button");
  b.textContent = ["PAD", "BRASS", "E.PIANO", "BELL", "BASS"][i];
  b.title = p.name;
  b.dataset.preset = p.id;
  b.onclick = () => choosePreset(p.id);
  $("quickPresets").append(b);
});
patchList.slice(10).forEach((p) => {
  const b = document.createElement("button");
  b.textContent = p.name;
  b.dataset.preset = p.id;
  b.onclick = () => choosePreset(p.id);
  $("newPresets").append(b);
});
function currentParams() {
  return synth
    ? synth.getParams()
    : { ...patchList.find((p) => p.id === preset.value).params, ...edited };
}
function updateCharacter() {
  const p = currentParams();
  for (const name of ["wave", "wave2", "unison", "mode", "legato"])
    $(name).value = p[name];
  $("wave").disabled = $("wave2").disabled = p.engine === "fm";
  $("legato").disabled = p.mode !== "mono";
  const pulse =
    p.engine !== "fm" && (p.wave === "pulse" || p.wave2 === "pulse");
  for (const name of [
    "pulseWidth",
    "pwmDepth",
    "pwmRate",
    "unisonDetune",
    "stereoSpread",
    "portamento",
  ]) {
    const disabled =
      name.startsWith("pwm") || name === "pulseWidth"
        ? !pulse
        : name === "portamento"
          ? p.mode !== "mono"
          : p.unison === 1;
    $("param-" + name).disabled = disabled;
    $("param-" + name).parentElement.style.opacity = disabled ? ".35" : "1";
  }
  $("motionHint").textContent =
    p.mode === "mono"
      ? "Hold a key, play another, then release it to return. Glide connects the pitches."
      : pulse
        ? "Hold a chord to hear the pulse move. Width and PWM edits shape your next phrase."
        : "Choose Pulse / PWM on either oscillator to hear pulse-width modulation.";
  $("engineType").textContent =
    p.engine === "fm"
      ? `${p.unison}× FM`
      : `${p.unison}× ${p.wave === "pulse" || p.wave2 === "pulse" ? "PWM" : "ANALOG"}`;
}
for (const name of ["wave", "wave2", "unison", "mode", "legato"])
  $(name).onchange = (e) => {
    const value = ["unison", "legato"].includes(name)
      ? +e.target.value
      : e.target.value;
    if (name !== "legato") panic();
    edited[name] = value;
    if (synth) synth.setParam(name, value);
    updateCharacter();
  };
function choosePreset(id) {
  if (synth) panic();
  preset.value = id;
  Object.keys(edited).forEach((k) => delete edited[k]);
  if (synth) synth.setPreset(id);
  const p = patchList.find((p) => p.id === id);
  $("patchNumber").textContent =
    `P.${String(patchList.indexOf(p) + 1).padStart(2, "0")}`;
  $("category").textContent = p.category;
  $("patchName").textContent = p.name;
  $("patchDescription").textContent = p.description;
  $("engineType").textContent =
    p.params.engine === "fm"
      ? "FM SYNTHESIS"
      : `${p.params.wave.toUpperCase().replace("TOOTH", "")} + ${p.params.wave2.toUpperCase().replace("TOOTH", "")}`;
  controls.forEach((s) => updateControl(s, p.params[s[0]]));
  updateCharacter();
  document
    .querySelectorAll("[data-preset]")
    .forEach((b) => b.classList.toggle("active", b.dataset.preset === id));
  for (const id of ["detune", "envAmount"]) {
    $(`param-${id}`).disabled = p.params.engine === "fm";
    $(`param-${id}`).parentElement.style.opacity =
      p.params.engine === "fm" ? ".35" : "1";
  }
}
preset.onchange = () => choosePreset(preset.value);
$("prev").onclick = () =>
  choosePreset(
    patchList[(preset.selectedIndex + patchList.length - 1) % patchList.length]
      .id,
  );
$("next").onclick = () =>
  choosePreset(patchList[(preset.selectedIndex + 1) % patchList.length].id);
async function ensureAudio() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    if (!synth) {
      synth = new NeonKeys({
        preset: preset.value,
        volume: +$("volume").value,
      });
      Object.entries(edited).forEach(([k, v]) => synth.setParam(k, v));
      synth.setSustain(sustainLatch || spaceHeld);
      synth.setModulation(+$("mod").value);
      synth.setPitchBend(+$("bend").value);
      const analyser = synth.context.createAnalyser();
      analyser.fftSize = 1024;
      synth.output.connect(analyser);
      drawScope(analyser);
      synth.context.onstatechange = updateStatus;
    }
    await synth.resume();
    updateStatus();
    return synth;
  })()
    .catch((e) => {
      $("error").hidden = false;
      $("error").textContent = `Audio could not start: ${e.message}`;
      throw e;
    })
    .finally(() => {
      initPromise = null;
    });
  return initPromise;
}
function updateStatus() {
  const running = synth?.context.state === "running";
  $("status").textContent = running ? "AUDIO ONLINE" : "AUDIO STANDBY";
  $("statusLed").classList.toggle("on", running);
  $("power").textContent = running ? "Audio enabled ✓" : "Enable audio ↗";
}
$("power").onclick = () => ensureAudio().catch(() => {});
function drawScope(analyser) {
  const canvas = $("scope"),
    ctx = canvas.getContext("2d"),
    data = new Uint8Array(analyser.fftSize);
  function frame() {
    animation = requestAnimationFrame(frame);
    analyser.getByteTimeDomainData(data);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "#a1dbc8";
    ctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * canvas.width,
        y = (data[i] / 255) * canvas.height;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    ctx.stroke();
    $("voiceCount").textContent =
      `${String(synth.voices.size).padStart(2, "0")} VOICES`;
  }
  frame();
}
function refreshKeys() {
  for (const [n, k] of keys)
    k.classList.toggle(
      "active",
      [...inputs.values()].some((v) => v.note === n),
    );
}
async function press(source, note) {
  if (inputs.has(source)) return;
  if (demoOn) panic();
  const entry = { note, voice: null };
  inputs.set(source, entry);
  refreshKeys();
  try {
    await ensureAudio();
    if (inputs.get(source) !== entry) return;
    if (!arpOn) entry.voice = synth.noteOn(note, +$("velocity").value);
    else if (inputs.size === 1) {
      nextTick = Math.max(
        synth.context.currentTime,
        synth.monoEventTime + 0.001,
      );
      step = 0;
    }
  } catch {
    inputs.delete(source);
    refreshKeys();
  }
}
function release(source) {
  const v = inputs.get(source);
  if (!v) return;
  if (v.voice) synth.noteOff(v.voice);
  inputs.delete(source);
  refreshKeys();
}
let whiteIndex = 0;
const names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
for (let n = 48; n <= 84; n++) {
  const black = [1, 3, 6, 8, 10].includes(n % 12);
  const k = document.createElement("button");
  k.type = "button";
  k.className = `key ${black ? "black" : "white"}`;
  k.dataset.note = n;
  k.setAttribute("aria-label", `${names[n % 12]}${Math.floor(n / 12) - 1}`);
  k.innerHTML = `<span class="note">${n % 12 === 0 ? "C" + (Math.floor(n / 12) - 1) : ""}</span><span class="binding"></span>`;
  if (black) k.style.left = `${(whiteIndex / 22) * 100 - 1.375}%`;
  else whiteIndex++;
  $("keyboard").append(k);
  keys.set(n, k);
  k.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    k.setPointerCapture(e.pointerId);
    press(`p${e.pointerId}`, n);
  });
  k.addEventListener("pointerup", (e) => release(`p${e.pointerId}`));
  k.addEventListener("pointercancel", (e) => release(`p${e.pointerId}`));
  k.addEventListener("lostpointercapture", (e) => release(`p${e.pointerId}`));
  k.addEventListener("keydown", (e) => {
    if (e.code === "Enter" && !e.repeat) {
      e.preventDefault();
      press("focus", n);
    }
  });
  k.addEventListener("keyup", (e) => {
    if (e.code === "Enter") {
      e.preventDefault();
      release("focus");
    }
  });
  k.addEventListener("blur", () => release("focus"));
}
function changeOctave(delta) {
  inputs.forEach((_, id) => release(id));
  octave = Math.max(-2, Math.min(2, octave + delta));
  $("octaveValue").textContent = octave > 0 ? `+${octave}` : octave;
  $("octaveDown").disabled = octave === -2;
  $("octaveUp").disabled = octave === 2;
  keys.forEach((k) => (k.querySelector(".binding").textContent = ""));
  boundNotes.forEach((n, i) => {
    const k = keys.get(n + octave * 12);
    if (k) k.querySelector(".binding").textContent = bindings[i].toUpperCase();
  });
}
$("octaveDown").onclick = () => changeOctave(-1);
$("octaveUp").onclick = () => changeOctave(1);
function updateSustain() {
  const on = sustainLatch || spaceHeld;
  synth?.setSustain(on);
  $("sustain").setAttribute("aria-pressed", on);
}
$("sustain").onclick = () => {
  sustainLatch = !sustainLatch;
  updateSustain();
};
const isField = (e) =>
  ["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName);
document.addEventListener("keydown", (e) => {
  if (e.code === "Escape") {
    panic();
    return;
  }
  if (isField(e) || e.ctrlKey || e.metaKey || e.altKey) return;
  if (e.code === "Space") {
    e.preventDefault();
    spaceHeld = true;
    updateSustain();
    return;
  }
  const key = e.key.toLowerCase();
  if (key === "z" || key === "x") {
    if (!e.repeat) changeOctave(key === "z" ? -1 : 1);
    return;
  }
  const i = bindings.indexOf(key);
  if (i >= 0) {
    e.preventDefault();
    if (!e.repeat) press(`k${e.code}`, boundNotes[i] + octave * 12);
  }
});
document.addEventListener("keyup", (e) => {
  if (e.code === "Space") {
    spaceHeld = false;
    updateSustain();
  }
  release(`k${e.code}`);
});
$("volume").oninput = (e) => {
  $("volumeValue").textContent = `${Math.round(+e.target.value * 100)}%`;
  synth?.setVolume(+e.target.value);
};
$("velocity").oninput = (e) =>
  ($("velocityValue").textContent = Math.round(+e.target.value * 100));
$("bend").oninput = (e) => synth?.setPitchBend(+e.target.value);
function resetBend() {
  $("bend").value = 0;
  synth?.setPitchBend(0);
}
["pointerup", "pointercancel", "blur", "keyup"].forEach((event) =>
  $("bend").addEventListener(event, resetBend),
);
$("mod").oninput = (e) => synth?.setModulation(+e.target.value);
$("tempo").oninput = (e) => ($("tempoValue").textContent = e.target.value);
$("arp").onclick = async () => {
  try {
    await ensureAudio();
    arpOn = !arpOn;
    demoOn = false;
    updateDemoButton();
    synth.allNotesOff({ immediate: true });
    inputs.clear();
    refreshKeys();
    sustainLatch = spaceHeld = false;
    updateSustain();
    $("arp").setAttribute("aria-pressed", arpOn);
    $("arp").textContent = arpOn ? "ON" : "OFF";
    nextTick = synth.context.currentTime;
    step = 0;
  } catch {}
};
function updateDemoButton() {
  $("demo").classList.toggle("playing", demoOn);
  $("demo").innerHTML = demoOn ? "■ &nbsp; Stop demo" : "▶ &nbsp; Play demo";
}
$("demo").onclick = async () => {
  try {
    await ensureAudio();
    const start = !demoOn;
    panic();
    demoOn = start;
    nextTick = synth.context.currentTime + 0.04;
    step = 0;
    updateDemoButton();
  } catch {}
};
function panic() {
  demoOn = false;
  sustainLatch = false;
  spaceHeld = false;
  inputs.clear();
  synth?.allNotesOff({ immediate: true });
  updateSustain();
  refreshKeys();
  resetBend();
  updateDemoButton();
}
$("panic").onclick = panic;
window.addEventListener("blur", panic);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) panic();
});
const chords = [
  [57, 60, 64, 67],
  [53, 57, 60, 64],
  [48, 52, 55, 59],
  [55, 59, 62, 65],
];
const clock = setInterval(() => {
  if (
    !synth ||
    synth.context.state !== "running" ||
    (!demoOn && (!arpOn || !inputs.size))
  )
    return;
  const now = synth.context.currentTime;
  if (nextTick < now) nextTick = now + 0.01;
  const duration = 60 / +$("tempo").value / 4;
  while (nextTick < now + 0.09) {
    if (demoOn) {
      const chord = chords[Math.floor(step / 16) % 4];
      const bass = preset.value === "bass" || preset.value === "rubber-bass";
      const mono = synth.params.mode === "mono";
      if (bass) {
        if (step % 2 === 0)
          synth.playNote(chord[0] - 12, duration * 1.4, 0.85, {
            when: nextTick,
          });
      } else if (mono) {
        if (step % 2 === 0)
          synth.playNote(
            chord[[0, 2, 1, 3][Math.floor(step / 2) % 4]] + 12,
            duration * 1.7,
            0.78,
            { when: nextTick },
          );
      } else {
        if (step % 16 === 0)
          chord.forEach((n) =>
            synth.playNote(n, duration * 12, 0.56, { when: nextTick }),
          );
        if (step % 2 === 0)
          synth.playNote(
            chord[[0, 2, 1, 3][Math.floor(step / 2) % 4]] + 12,
            duration * 1.1,
            0.65,
            { when: nextTick },
          );
      }
    } else {
      let notes = [...new Set([...inputs.values()].map((v) => v.note))].sort(
        (a, b) => a - b,
      );
      if ($("arpOctaves").value === "2")
        notes = [
          ...notes,
          ...notes.map((n) => n + 12).filter((n) => n <= 127),
        ].sort((a, b) => a - b);
      let index = step % notes.length;
      const mode = $("arpMode").value;
      if (mode === "down") index = notes.length - 1 - index;
      else if (mode === "random")
        index = Math.floor(Math.random() * notes.length);
      else if (mode === "bounce" && notes.length > 1) {
        const span = notes.length * 2 - 2;
        index = step % span;
        if (index >= notes.length) index = span - index;
      }
      synth.playNote(notes[index], duration * 0.7, +$("velocity").value, {
        when: nextTick,
      });
    }
    nextTick += duration;
    step++;
  }
}, 25);
$("helpToggle").onclick = () => {
  const open = $("help").hidden;
  $("help").hidden = !open;
  $("helpToggle").setAttribute("aria-expanded", open);
};
window.addEventListener(
  "pagehide",
  () => {
    clearInterval(clock);
    cancelAnimationFrame(animation);
    synth?.dispose();
  },
  { once: true },
);
choosePreset("midnight");
changeOctave(0);
// Static idle trace before Web Audio has been enabled.
{
  const c = $("scope").getContext("2d");
  c.strokeStyle = "#577c6c";
  c.beginPath();
  c.moveTo(0, 36);
  c.lineTo(550, 36);
  c.stroke();
}
