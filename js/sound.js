// Sound effects, synthesised with Web Audio: no audio files to load, license or cache.
// Browsers only allow sound after the player has touched the page, so the audio context is
// created lazily on the first interaction (unlock()).

let ctx = null;
let master = null;
let enabled = true;
let noiseBuf = null;

export function setSoundEnabled(on) {
  enabled = on;
}

export function unlock() {
  if (!enabled) return;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
  } catch { ctx = null; }
}

// --- building blocks ---

function env(gain, t, attack, decay, peak) {
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
}

function noise(t, { dur = 0.05, type = 'bandpass', freq = 3000, q = 1, peak = 0.4, attack = 0.003, sweepTo = null }) {
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.setValueAtTime(freq, t);
  if (sweepTo) f.frequency.exponentialRampToValueAtTime(sweepTo, t + dur);
  f.Q.value = q;
  const g = ctx.createGain();
  env(g, t, attack, dur, peak);
  src.connect(f).connect(g).connect(master);
  src.start(t, Math.random() * 0.5);
  src.stop(t + attack + dur + 0.05);
}

function tone(t, { freq = 440, to = null, dur = 0.2, type = 'sine', peak = 0.3, attack = 0.005, lowpass = null }) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  const g = ctx.createGain();
  env(g, t, attack, dur, peak);
  let node = o.connect(g);
  if (lowpass) {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = lowpass;
    node = node.connect(f);
  }
  node.connect(master);
  o.start(t);
  o.stop(t + attack + dur + 0.05);
}

// --- the effects ---

const FX = {
  // typewriter key: picking a suspect
  select(t) {
    noise(t, { dur: 0.018, type: 'highpass', freq: 2500, peak: 0.35 });
    tone(t, { freq: 1900, dur: 0.02, type: 'square', peak: 0.04 });
  },
  // pencil scratch: jotting a note
  note(t) {
    noise(t, { dur: 0.05, freq: 5200, q: 2.5, peak: 0.16, sweepTo: 3800 });
  },
  // eraser: rubbing a note out
  erase(t) {
    noise(t, { dur: 0.09, freq: 1400, q: 1.2, peak: 0.14, sweepTo: 900 });
  },
  // marker: two strokes of an X
  cross(t) {
    noise(t, { dur: 0.05, freq: 2600, q: 3, peak: 0.22, sweepTo: 1800 });
    noise(t + 0.07, { dur: 0.05, freq: 2900, q: 3, peak: 0.22, sweepTo: 2000 });
  },
  uncross(t) {
    noise(t, { dur: 0.08, freq: 1200, q: 1.5, peak: 0.12, sweepTo: 800 });
  },
  // rubber stamp: placing someone for good
  place(t) {
    tone(t, { freq: 140, to: 55, dur: 0.18, peak: 0.6 });
    noise(t, { dur: 0.04, type: 'lowpass', freq: 900, peak: 0.5 });
    noise(t + 0.01, { dur: 0.03, type: 'highpass', freq: 3000, peak: 0.12 });
  },
  // lifting someone back off the board
  remove(t) {
    tone(t, { freq: 300, to: 520, dur: 0.09, type: 'triangle', peak: 0.12 });
  },
  // a page turning back: undo
  undo(t) {
    noise(t, { dur: 0.16, freq: 600, q: 0.8, peak: 0.2, sweepTo: 3500, attack: 0.02 });
  },
  // the informant's bell: hints
  hint(t) {
    tone(t, { freq: 1318, dur: 0.6, type: 'sine', peak: 0.16 });
    tone(t, { freq: 1976, dur: 0.45, type: 'sine', peak: 0.07 });
  },
  // something doesn't add up
  wrong(t) {
    tone(t, { freq: 196, dur: 0.16, type: 'square', peak: 0.08, lowpass: 900 });
    tone(t + 0.17, { freq: 147, dur: 0.28, type: 'square', peak: 0.08, lowpass: 700 });
  },
  // a blocked square
  bump(t) {
    tone(t, { freq: 110, dur: 0.08, type: 'triangle', peak: 0.2 });
  },
  // paper crumpled up: restart
  restart(t) {
    for (let k = 0; k < 6; k++) noise(t + k * 0.035, { dur: 0.04, freq: 1500 + Math.random() * 2500, q: 1, peak: 0.18 });
  },
  // case closed: a little brass fanfare, then the stamp
  solved(t) {
    [523, 659, 784, 1047].forEach((f, i) => tone(t + i * 0.11, { freq: f, dur: i === 3 ? 0.55 : 0.12, type: 'sawtooth', peak: 0.1, lowpass: 2200 }));
    FX.place(t + 0.62);
  },
};

export function play(name) {
  if (!enabled || !FX[name]) return;
  unlock();
  if (!ctx || ctx.state !== 'running' && ctx.state !== 'suspended') return;
  try {
    FX[name](ctx.currentTime + 0.01);
  } catch { /* never let sound break the game */ }
}
