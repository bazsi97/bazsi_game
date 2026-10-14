// Small seeded RNG so every case number always generates the same puzzle.

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export class Rng {
  constructor(seed) {
    this.a = (typeof seed === 'string' ? hashString(seed) : seed) >>> 0;
  }
  // mulberry32
  float() {
    let t = (this.a = (this.a + 0x6d2b79f5) | 0);
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(n) {
    return Math.floor(this.float() * n);
  }
  range(lo, hi) {
    return lo + this.int(hi - lo + 1);
  }
  chance(p) {
    return this.float() < p;
  }
  pick(arr) {
    return arr[this.int(arr.length)];
  }
  // items: [[value, weight], ...]
  weighted(items) {
    const total = items.reduce((s, [, w]) => s + w, 0);
    let x = this.float() * total;
    for (const [v, w] of items) {
      if ((x -= w) < 0) return v;
    }
    return items[items.length - 1][0];
  }
  shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = this.int(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}
